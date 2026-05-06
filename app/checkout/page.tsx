"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Clock4,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browse";
import CheckoutAuthModal from "@/components/ui/AuthModal";
import SuccessModal from "@/components/ui/SuccessModal";

// --- Types ---
type PackageRow = {
  id: string;
  type: "self_photo" | "pas_foto" | "photographer";
  title: string;
  description: string | null;
  includes: string | null;
  duration_minutes: number | null;
  min_people: number | null;
  max_people: number | null;
  base_price_idr: number;
};

type AddonRow = {
  id: string;
  title: string;
  description: string | null;
  price_idr: number;
  is_active: boolean;
};

function formatIDR(n: number) {
  return "Rp " + new Intl.NumberFormat("id-ID").format(n);
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId");

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // --- Auth States ---
  const [sessionReady, setSessionReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // --- Success Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);

  // --- Data States ---
  const [pkg, setPkg] = useState<PackageRow | null>(null);
  const [addons, setAddons] = useState<AddonRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // --- Booking Form States ---
  const [date, setDate] = useState<string>(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  type Slot = { time: string; available: boolean };
  const [slots, setSlots] = useState<Slot[]>([]);
  const [time, setTime] = useState<string>("");
  const [fineStep, setFineStep] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const duration = pkg?.duration_minutes ?? 0;
  const needsSlot = duration > 0;

  // --- Calculations ---
  const addonsTotal = useMemo(() => {
    let total = 0;
    for (const a of addons) {
      const qty = selectedAddons[a.id] ?? 0;
      if (qty > 0) total += a.price_idr * qty;
    }
    return total;
  }, [addons, selectedAddons]);

  const grandTotal = (pkg?.base_price_idr ?? 0) + addonsTotal;

  // --- Load Package & Addons ---
  useEffect(() => {
    const run = async () => {
      if (!packageId) {
        setLoadingData(false);
        return;
      }
      setLoadingData(true);
      setErr("");

      const { data: pkgData, error: pkgErr } = await supabase
        .from("packages")
        .select("id,type,title,description,includes,duration_minutes,min_people,max_people,base_price_idr")
        .eq("id", packageId)
        .single();

      if (pkgErr) {
        setErr(pkgErr.message);
        setLoadingData(false);
        return;
      }

      setPkg(pkgData as PackageRow);

      const { data: addonData } = await supabase
        .from("addons")
        .select("id,title,description,price_idr,is_active")
        .eq("is_active", true)
        .order("price_idr", { ascending: true });

      setAddons((addonData ?? []) as AddonRow[]);
      setLoadingData(false);
    };
    run();
  }, [packageId, supabase]);

  // --- Fetch Time Availability ---
  const loadAvailability = useCallback(async () => {
    if (!packageId || !pkg) return;

    setErr("");
    setLoadingTimes(true);
    setSlots([]);
    setTime("");

    try {
      if ((pkg.duration_minutes ?? 0) <= 0) {
        setSlots([]);
        return;
      }

      const step = fineStep ? 5 : 15;
      const res = await fetch(
        `/api/availability/by-package?packageId=${encodeURIComponent(packageId)}&date=${encodeURIComponent(date)}&step=${step}`
      );

      const data = await res.json();
      if (!res.ok) {
        setErr(data?.message ?? "Gagal load jam tersedia");
        return;
      }
      setSlots(data.slots ?? []);
    } catch {
      setErr("Gagal load jam tersedia");
    } finally {
      setLoadingTimes(false);
    }
  }, [packageId, pkg, date, fineStep]);

  // --- Auth Listeners ---
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const has = !!data.session;
      setIsAuthed(has);
      if (data.session) setUserData(data.session.user);
      setSessionReady(true);
      if (!has) setAuthOpen(true);
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const has = !!session;
      setIsAuthed(has);
      if (session) setUserData(session.user);
      setSessionReady(true);
      if (has) {
        setAuthOpen(false);
        if ((pkg?.duration_minutes ?? 0) > 0) loadAvailability();
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [supabase, pkg?.duration_minutes, loadAvailability]);

  useEffect(() => {
    if (pkg && needsSlot) loadAvailability();
  }, [pkg, needsSlot, date, fineStep, loadAvailability]);

  // --- Form Handlers ---
  const toggleAddon = (addonId: string, checked: boolean) => {
    setSelectedAddons((prev) => {
      const next = { ...prev };
      if (!checked) delete next[addonId];
      else next[addonId] = next[addonId] ?? 1;
      return next;
    });
  };

  const setAddonQty = (addonId: string, qty: number) => {
    setSelectedAddons((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[addonId];
      else next[addonId] = qty;
      return next;
    });
  };

  // --- Final Submit ---
  const submit = async () => {
    setErr("");
    if (!isAuthed) { setAuthOpen(true); setErr("Login dulu untuk melanjutkan booking."); return; }
    if (!pkg || !packageId) return;
    if (needsSlot && (!date || !time)) { setErr("Pilih tanggal dan jam dulu."); return; }

    setSubmitting(true);
    try {
      const payload = {
        packageId,
        date,
        time,
        notes: "",
        addons: Object.entries(selectedAddons).map(([addonId, qty]) => ({ addonId, qty })),
      };

      const res = await fetch("/api/orders/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErr(data?.message ?? "Gagal booking. Coba jam lain.");
        return;
      }

      // Trigger Modal Sukses
      setOrderResult({
        id: data.orderId,
        userName: userData?.user_metadata?.full_name || "Customer PAMA",
        userEmail: userData?.email || "-",
        packageName: pkg.title,
        totalPrice: grandTotal,
        date: date,
        time: time || "Jadwal Admin",
      });
      setIsModalOpen(true);

    } catch {
      setErr("Gagal booking. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Initial Loading UI ---
  if (!packageId) return (
    <main className="min-h-screen bg-[#FBF7F1] text-[#1a0505] flex items-center justify-center">
      <div className="rounded-[28px] border border-[#8B1A1A]/15 bg-white/70 p-6 backdrop-blur-sm">
        packageId tidak ditemukan. Kembali ke halaman paket.
      </div>
    </main>
  );

  if (!sessionReady) return (
    <main className="min-h-screen bg-[#FBF7F1] text-[#1a0505] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#8B1A1A]" />
    </main>
  );

  return (
    <main className="relative min-h-screen bg-[#FBF7F1] text-[#1a0505] pb-20">
      <CheckoutAuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <SuccessModal isOpen={isModalOpen} data={orderResult} onClose={() => { setIsModalOpen(false); router.push("/dashboard-client"); }} />

      {/* Ornaments */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-[#8B1A1A]/8 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-10 -left-32 h-[380px] w-[380px] rounded-full bg-[#D4A373]/15 blur-[110px]" />

      <div className="mx-auto max-w-5xl px-5 py-10 lg:py-14">
        {/* Header Section */}
        <div className="flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#8B1A1A]/15 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#8B1A1A] backdrop-blur-sm">
            <Sparkles className="h-4 w-4" /> Checkout Booking
          </div>
          <h1 className="text-3xl sm:text-4xl font-fraunces">Lengkapi jadwal & add-ons</h1>
          <p className="max-w-2xl text-sm text-[#3a1a1a]/70">Booking self-photo dan pas foto bisa pilih jam tersedia. Untuk jasa fotografer, jadwal menyesuaikan admin.</p>
        </div>

        {err && (
          <div className="mt-6 rounded-[22px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Form Side */}
          <div className="lg:col-span-7">
            <div className="rounded-[32px] border border-[#8B1A1A]/12 bg-white/70 p-6 backdrop-blur-sm sm:p-8">
              
              {/* Package Detail Card */}
              {loadingData || !pkg ? (
                <div className="rounded-2xl border border-[#8B1A1A]/10 bg-white/60 p-5 text-sm">Loading paket...</div>
              ) : (
                <div className="rounded-2xl border border-[#8B1A1A]/10 bg-gradient-to-r from-[#FBF7F1] to-[#FFF8E7] p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8B1A1A]">{pkg.type}</div>
                  <div className="mt-2 text-2xl font-fraunces text-[#1a0505]">{pkg.title}</div>
                  <div className="mt-2 text-sm text-[#3a1a1a]/70">{pkg.includes ?? pkg.description ?? ""}</div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white/70 px-4 py-3">Durasi: <b>{needsSlot ? `${duration} menit` : "menyesuaikan admin"}</b></div>
                    <div className="rounded-xl bg-white/70 px-4 py-3">Harga: <b>{formatIDR(pkg.base_price_idr)}</b></div>
                  </div>
                </div>
              )}

              {/* Scheduling Section */}
              {pkg && needsSlot ? (
                <div className="mt-7">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B1A1A]">Jadwal</div>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-[#8B1A1A] mb-1 block">TANGGAL</label>
                      <div className="flex items-center gap-2 rounded-2xl border border-[#8B1A1A]/15 bg-white/70 px-4 py-3">
                        <CalendarDays className="h-4 w-4 text-[#8B1A1A]" />
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <button type="button" onClick={loadAvailability} disabled={loadingTimes} className="w-full rounded-2xl border border-[#8B1A1A]/15 bg-white/70 px-4 py-3 text-sm font-semibold text-[#8B1A1A] hover:bg-white transition">
                        {loadingTimes ? "Loading..." : "Refresh Jam"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#8B1A1A]/15 bg-white/70 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#8B1A1A]">
                        <Clock4 className="h-4 w-4" /> <span className="text-xs font-bold uppercase">Pilih Jam</span>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setFineStep(false)} className={`rounded-full border px-3 py-1 text-xs transition ${!fineStep ? "bg-[#8B1A1A] text-white" : "bg-white/60 text-[#8B1A1A]"}`}>15m</button>
                        <button type="button" onClick={() => setFineStep(true)} className={`rounded-full border px-3 py-1 text-xs transition ${fineStep ? "bg-[#8B1A1A] text-white" : "bg-white/60 text-[#8B1A1A]"}`}>5m</button>
                      </div>
                    </div>

                    {loadingTimes ? <div className="text-sm opacity-50">Memuat...</div> : (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {slots.map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => slot.available && setTime(slot.time)}
                              className={`rounded-full px-3 py-2 text-sm font-semibold transition
                                ${!slot.available
                                  ? "bg-[#d1d5db] text-[#9ca3af] cursor-not-allowed"
                                  : time === slot.time
                                    ? "bg-[#8B1A1A] text-white"
                                    : "bg-[#FFC107] text-[#1a0505] hover:bg-[#FFB300]"
                                }`}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                    )}
                  </div>
                </div>
              ) : pkg && !needsSlot && (
                <div className="mt-7 rounded-2xl border border-[#8B1A1A]/12 bg-gradient-to-r from-[#FBF7F1] to-[#FFF8E7] p-5">
                  <div className="flex items-center gap-2 text-[#8B1A1A]"><ShieldCheck className="h-4 w-4" /><span className="text-xs font-bold uppercase">Jadwal oleh admin</span></div>
                  <p className="mt-2 text-sm opacity-70">Jadwal sesi fotografer akan dikonfirmasi secara manual oleh admin setelah pesanan dibuat.</p>
                </div>
              )}

              {/* Addons Section */}
              <div className="mt-8">
                <div className="text-xs font-bold text-[#8B1A1A] mb-3 uppercase tracking-widest">Add-ons</div>
                <div className="grid gap-2">
                  {addons.map((a) => {
                    const qty = selectedAddons[a.id] ?? 0;
                    return (
                      <div key={a.id} className="flex items-center justify-between rounded-2xl border border-[#8B1A1A]/12 bg-white/70 px-4 py-3">
                        <label className="flex items-center gap-3 text-sm cursor-pointer">
                          <input type="checkbox" checked={qty > 0} onChange={(e) => toggleAddon(a.id, e.target.checked)} className="accent-[#8B1A1A]" />
                          <span><span className="font-semibold">{a.title}</span> <span className="opacity-50">({formatIDR(a.price_idr)})</span></span>
                        </label>
                        {qty > 0 && <input type="number" min={1} value={qty} onChange={(e) => setAddonQty(a.id, Number(e.target.value))} className="w-16 rounded-xl border border-[#8B1A1A]/15 px-2 py-1 text-sm outline-none bg-white/80" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button onClick={submit} disabled={submitting || !pkg || (needsSlot && !time) || !isAuthed} className="mt-10 w-full flex items-center justify-center gap-2 rounded-full bg-[#8B1A1A] py-4 text-white font-bold shadow-lg hover:bg-[#6B1212] transition-all disabled:opacity-50 active:scale-[0.98]">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Buat Pesanan <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Sticky Summary Side */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-6 rounded-[32px] border border-[#8B1A1A]/12 bg-white/70 p-6 backdrop-blur-sm sm:p-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#8B1A1A] mb-4">Ringkasan</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Base Paket</span><b>{formatIDR(pkg?.base_price_idr ?? 0)}</b></div>
                <div className="flex justify-between"><span>Add-ons</span><b>{formatIDR(addonsTotal)}</b></div>
                <div className="my-3 h-px bg-[#8B1A1A]/10" />
                <div className="flex justify-between text-base font-bold"><span>Total Bayar</span><span className="text-[#8B1A1A] text-xl">{formatIDR(grandTotal)}</span></div>
              </div>

              <div className="mt-6 rounded-2xl border border-[#8B1A1A]/12 bg-gradient-to-r from-[#FBF7F1] to-[#FFF8E7] p-4">
                <div className="text-xs font-bold text-[#8B1A1A] uppercase mb-1">Rincian Waktu</div>
                <div className="text-sm">
                  {needsSlot ? (time ? <span><b>{date}</b> • <b>{time}</b></span> : "Belum pilih jam.") : "Ditentukan oleh Admin."}
                </div>
              </div>

              <div className="mt-6 text-[10px] leading-relaxed opacity-50 uppercase font-bold tracking-widest">
                Status Awal: <b>Pending</b><br/>
                Admin akan memvalidasi jadwal & pembayaran via WhatsApp.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}