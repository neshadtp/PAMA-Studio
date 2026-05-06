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

export default function CheckoutContent() {
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

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
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
    setAvailableTimes([]);
    setTime("");

    try {
      if ((pkg.duration_minutes ?? 0) <= 0) {
        setAvailableTimes([]);
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
      setAvailableTimes(data.available ?? []);
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
      <CheckoutAuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} title="Login untuk lanjut booking" subtitle="Masuk dulu biar kamu bisa pilih jadwal dan pesananmu tersimpan." />
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

        {loadingData ? (
          <div className="mt-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#8B1A1A]" />
          </div>
        ) : pkg ? (
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {/* Package Summary */}
            <div className="space-y-6">
              <div className="rounded-[28px] border border-[#8B1A1A]/15 bg-white/70 p-6 backdrop-blur-sm">
                <h2 className="mb-4 text-xl font-semibold">Paket Terpilih</h2>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{pkg.title}</h3>
                  {pkg.description && <p className="text-sm text-[#3a1a1a]/70">{pkg.description}</p>}
                  {pkg.includes && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B1A1A]">Includes</p>
                      <p className="text-sm">{pkg.includes}</p>
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium">Harga Paket</span>
                    <span className="text-lg font-bold text-[#8B1A1A]">{formatIDR(pkg.base_price_idr)}</span>
                  </div>
                </div>
              </div>

              {/* Add-ons */}
              {addons.length > 0 && (
                <div className="rounded-[28px] border border-[#8B1A1A]/15 bg-white/70 p-6 backdrop-blur-sm">
                  <h2 className="mb-4 text-xl font-semibold">Add-ons</h2>
                  <div className="space-y-4">
                    {addons.map((addon) => {
                      const qty = selectedAddons[addon.id] ?? 0;
                      return (
                        <div key={addon.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={qty > 0}
                              onChange={(e) => toggleAddon(addon.id, e.target.checked)}
                              className="h-4 w-4 rounded border-[#8B1A1A] text-[#8B1A1A] focus:ring-[#8B1A1A]"
                            />
                            <div>
                              <p className="text-sm font-medium">{addon.title}</p>
                              {addon.description && <p className="text-xs text-[#3a1a1a]/70">{addon.description}</p>}
                              <p className="text-sm font-bold text-[#8B1A1A]">{formatIDR(addon.price_idr)}</p>
                            </div>
                          </div>
                          {qty > 0 && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setAddonQty(addon.id, qty - 1)}
                                className="h-6 w-6 rounded-full border border-[#8B1A1A] text-[#8B1A1A] hover:bg-[#8B1A1A] hover:text-white"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-sm">{qty}</span>
                              <button
                                onClick={() => setAddonQty(addon.id, qty + 1)}
                                className="h-6 w-6 rounded-full border border-[#8B1A1A] text-[#8B1A1A] hover:bg-[#8B1A1A] hover:text-white"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Form */}
            <div className="space-y-6">
              {/* Date & Time */}
              {needsSlot && (
                <div className="rounded-[28px] border border-[#8B1A1A]/15 bg-white/70 p-6 backdrop-blur-sm">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                    <CalendarDays className="h-5 w-5" /> Pilih Jadwal
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tanggal</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full rounded-xl border border-[#8B1A1A]/30 bg-white px-4 py-3 text-sm focus:border-[#8B1A1A] focus:outline-none"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">Jam</label>
                        <button
                          onClick={() => setFineStep(!fineStep)}
                          className="text-xs text-[#8B1A1A] underline"
                        >
                          {fineStep ? "Interval 15 menit" : "Interval 5 menit"}
                        </button>
                      </div>
                      {loadingTimes ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-[#3a1a1a]/70">Loading jam tersedia...</span>
                        </div>
                      ) : availableTimes.length === 0 ? (
                        <p className="text-sm text-[#3a1a1a]/70">Tidak ada jam tersedia untuk tanggal ini.</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {availableTimes.map((t) => (
                            <button
                              key={t}
                              onClick={() => setTime(t)}
                              className={`rounded-lg border px-3 py-2 text-xs transition-all ${
                                time === t
                                  ? "border-[#8B1A1A] bg-[#8B1A1A] text-white"
                                  : "border-[#8B1A1A]/30 bg-white hover:border-[#8B1A1A]"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="rounded-[28px] border border-[#8B1A1A]/15 bg-white/70 p-6 backdrop-blur-sm">
                <h2 className="mb-4 text-xl font-semibold">Ringkasan Pesanan</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>{pkg.title}</span>
                    <span>{formatIDR(pkg.base_price_idr)}</span>
                  </div>
                  {Object.entries(selectedAddons).map(([addonId, qty]) => {
                    const addon = addons.find((a) => a.id === addonId);
                    if (!addon || qty <= 0) return null;
                    return (
                      <div key={addonId} className="flex justify-between text-sm">
                        <span>{addon.title} x{qty}</span>
                        <span>{formatIDR(addon.price_idr * qty)}</span>
                      </div>
                    );
                  })}
                  <hr className="border-[#8B1A1A]/20" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-[#8B1A1A]">{formatIDR(grandTotal)}</span>
                  </div>
                </div>
                <button
                  onClick={submit}
                  disabled={submitting || (!isAuthed)}
                  className="mt-6 w-full bg-[#8B1A1A] text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#6B1212] transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : !isAuthed ? (
                    "Login untuk Booking"
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Konfirmasi Booking
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-10 rounded-[28px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            Paket tidak ditemukan.
          </div>
        )}
      </div>
    </main>
  );
}