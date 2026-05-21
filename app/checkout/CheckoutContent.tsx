"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  Clock4,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  Check,
  Plus,
  Minus,
  Image as ImageIcon,
  Users,
  Timer,
} from "lucide-react";

import Navbar from "../../src/components/layout/Navbar";
import Footer from "../../src/components/layout/Footer";
import CheckoutAuthModal from "../../src/components/ui/AuthModal";
import SuccessModal from "../../src/components/ui/SuccessModal";

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

type SlotInfo = {
  time: string;
  available: boolean;
};

type UserData = {
  email?: string;
  profile?: { full_name?: string | null };
  user_metadata?: { full_name?: string | null };
};

type OrderResult = {
  id: string;
  userName: string;
  userEmail: string;
  packageName: string;
  totalPrice: number;
  date: string;
  time: string;
};

function formatIDR(n: number) {
  return "Rp " + new Intl.NumberFormat("id-ID").format(n);
}

function getIntervalLabel(type: string, title: string): string {
  const t = title.toLowerCase();
  if (t.includes("studio 1")) return "30 menit";
  return "60 menit";
}

function getStudioBadge(type: string, title: string): { label: string; color: string } {
  const t = title.toLowerCase();
  if (t.includes("studio 1")) return { label: "Self Photo Studio 1", color: "bg-amber-100 text-amber-700" };
  if (t.includes("studio 2") && t.includes("molding")) return { label: "Studio 2 Molding", color: "bg-purple-100 text-purple-700" };
  if (t.includes("studio 2")) return { label: "Self Photo Studio 2", color: "bg-blue-100 text-blue-700" };
  if (type === "pas_foto") return { label: "Pas Foto", color: "bg-green-100 text-green-700" };
  if (type === "photographer") return { label: "Jasa Fotografer", color: "bg-rose-100 text-rose-700" };
  return { label: "Paket", color: "bg-gray-100 text-gray-700" };
}

export default function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId");
  const isValidPackageId = !!packageId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(packageId);

  const [sessionReady, setSessionReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  const [pkg, setPkg] = useState<PackageRow | null>(null);
  const [addons, setAddons] = useState<AddonRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [intervalInfo, setIntervalInfo] = useState<string>("");

  const [date, setDate] = useState<string>(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const [availableSlots, setAvailableSlots] = useState<SlotInfo[]>([]);
  const [time, setTime] = useState<string>("");
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const duration = pkg?.duration_minutes ?? 0;
  const needsSlot = duration > 0;

  const addonsTotal = useMemo(() => {
    let total = 0;
    for (const a of addons) {
      const qty = selectedAddons[a.id] ?? 0;
      if (qty > 0) total += a.price_idr * qty;
    }
    return total;
  }, [addons, selectedAddons]);

  const grandTotal = (pkg?.base_price_idr ?? 0) + addonsTotal;

  useEffect(() => {
    const run = async () => {
      if (!packageId) {
        setLoadingData(false);
        return;
      }

      if (!isValidPackageId) {
        setErr("Paket tidak valid.");
        setLoadingData(false);
        return;
      }

      setLoadingData(true);
      setErr("");

      try {
        const packageRes = await fetch(`/api/packages/${encodeURIComponent(packageId)}`);
        const packageJson = await packageRes.json();

        if (!packageRes.ok) {
          setErr(packageJson.message || "Gagal memuat paket");
          setLoadingData(false);
          return;
        }

        setPkg(packageJson.package as PackageRow);

        const addonsRes = await fetch("/api/addons");
        const addonsJson = await addonsRes.json();
        if (!addonsRes.ok) {
          setErr(addonsJson.message || "Gagal memuat addons");
          setLoadingData(false);
          return;
        }

        setAddons((addonsJson.addons ?? []) as AddonRow[]);
      } catch (error) {
        console.error("Checkout load data error:", error);
        setErr("Gagal memuat data paket");
      } finally {
        setLoadingData(false);
      }
    };
    run();
  }, [packageId, isValidPackageId]);

  const loadAvailability = useCallback(async () => {
    if (!packageId || !pkg) return;

    setErr("");
    setLoadingTimes(true);
    setAvailableSlots([]);
    setTime("");

    try {
      if ((pkg.duration_minutes ?? 0) <= 0) {
        setAvailableSlots([]);
        return;
      }

      const res = await fetch(
        `/api/availability/by-package?packageId=${encodeURIComponent(packageId)}&date=${encodeURIComponent(date)}`
      );

      const data = await res.json();
      if (!res.ok) {
        setErr(data?.message ?? "Gagal load jam tersedia");
        return;
      }
      setAvailableSlots((data.slots ?? data.available ?? []) as SlotInfo[]);
      setIntervalInfo(data.interval ? `Interval ${data.interval} menit` : "");
    } catch {
      setErr("Gagal load jam tersedia");
    } finally {
      setLoadingTimes(false);
    }
  }, [packageId, pkg, date]);

  const handleAuthSuccess = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setIsAuthed(true);
        setUserData(data.user);
        setAuthOpen(false);
        if ((pkg?.duration_minutes ?? 0) > 0) {
          loadAvailability();
        }
      } else {
        setAuthOpen(true);
      }
    } catch {
      setAuthOpen(true);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          setIsAuthed(false);
          setUserData(null);
          setSessionReady(true);
          setAuthOpen(true);
          return;
        }

        const data = await res.json();
        setIsAuthed(true);
        setUserData(data.user);
        setSessionReady(true);
        setAuthOpen(false);

        if ((pkg?.duration_minutes ?? 0) > 0) {
          loadAvailability();
        }
      } catch (error) {
        console.error("Checkout auth init error:", error);
        setIsAuthed(false);
        setUserData(null);
        setSessionReady(true);
        setAuthOpen(true);
      }
    };

    init();
  }, [loadAvailability]);

  useEffect(() => {
    if (pkg && needsSlot) loadAvailability();
  }, [pkg, needsSlot, date, loadAvailability]);

  useEffect(() => {
    if (packageId && !isValidPackageId) {
      router.replace("/paket");
    }
  }, [packageId, isValidPackageId, router]);

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
      else next[addonId] = Math.min(qty, 20);
      return next;
    });
  };

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

      setOrderResult({
        id: data.orderId,
        userName: userData?.profile?.full_name || userData?.user_metadata?.full_name || "Customer PAMA",
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

  if (!packageId) return (
    <div className="min-h-screen bg-[#FBF7F1]">
      <Navbar />
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-[#3a1a1a]/60 mb-4">packageId tidak ditemukan.</p>
          <Link href="/paket" className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B1A1A] text-white text-sm font-semibold rounded-full hover:bg-[#6B1212] transition-all">
            <ChevronLeft size={16} /> Kembali ke Paket
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (!sessionReady) return (
    <div className="min-h-screen bg-[#FBF7F1] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#8B1A1A]" />
    </div>
  );

  const studioBadge = pkg ? getStudioBadge(pkg.type ?? "", pkg.title ?? "") : null;
  const intervalLabel = pkg ? getIntervalLabel(pkg.type ?? "", pkg.title ?? "") : "";

  return (
    <div className="min-h-screen bg-[#FBF7F1] text-[#1a0505]">
      <CheckoutAuthModal
        isOpen={authOpen}
        onClose={() => {
          setAuthOpen(false);
        }}
        title="Login untuk lanjut booking"
        subtitle="Masuk dulu biar kamu bisa pilih jadwal dan pesananmu tersimpan."
        redirectType="checkout"
        packageId={packageId ?? undefined}
        onAuthSuccess={handleAuthSuccess}
      />
      <SuccessModal isOpen={isModalOpen} data={orderResult} onClose={() => { setIsModalOpen(false); router.push("/dashboard-client"); router.refresh(); }} />

      <Navbar />

      <div className="relative">
        <div className="pointer-events-none absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full bg-[#8B1A1A]/8 blur-[120px]" />
        <div className="pointer-events-none absolute top-40 -left-20 h-[300px] w-[300px] rounded-full bg-[#D4A373]/12 blur-[100px]" />

        <div className="mx-auto max-w-6xl px-5 py-10 lg:py-16">
          <Link href="/paket" className="group mb-8 inline-flex items-center gap-2 rounded-full border border-[#8B1A1A]/20 bg-white/70 px-4 py-2 text-sm font-medium text-[#8B1A1A] backdrop-blur-sm transition hover:bg-white/90">
            <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Kembali ke Paket
          </Link>

          <div className="flex flex-col gap-3 mb-10">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#8B1A1A]/15 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#8B1A1A] backdrop-blur-sm">
              <Sparkles className="h-4 w-4" /> Booking Session
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif text-[#1a0505]" style={{ fontFamily: "Fraunces, serif", fontWeight: 400 }}>
              Pilih jadwal & <span className="italic text-[#8B1A1A]">kelengkapan</span>
            </h1>
            <p className="max-w-2xl text-[15px] text-[#3a1a1a]/70">Studio 1 interval 30 menit. Studio 2, Pas Foto, dan Fotografer interval 60 menit.</p>
          </div>

          {err && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {err}
            </div>
          )}

          {loadingData ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#8B1A1A]" />
            </div>
          ) : pkg ? (
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Left Column - Package & Addons */}
              <div className="lg:col-span-7 space-y-6">
                {/* Package Card */}
                <div className="overflow-hidden rounded-[32px] border border-[#8B1A1A]/10 bg-white shadow-sm">
                  <div className="relative h-48 w-full bg-gradient-to-br from-[#8B1A1A] to-[#5C0E0E]">
                    <Image src="/images/foto-pama.webp" alt={pkg.title} fill className="object-cover opacity-40 mix-blend-overlay" unoptimized />
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <div className="flex items-center gap-2 mb-2">
                        {studioBadge && (
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${studioBadge.color}`}>
                            {studioBadge.label}
                          </span>
                        )}
                        {duration > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                            <Timer className="h-3 w-3" /> {duration} menit
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "Fraunces, serif" }}>{pkg.title}</h2>
                    </div>
                  </div>
                  <div className="p-6 space-y-5">
                    {pkg.description && (
                      <p className="text-sm text-[#3a1a1a]/70 leading-relaxed">{pkg.description}</p>
                    )}
                    {pkg.includes && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8B1A1A]">Yang Included</p>
                        <div className="flex flex-wrap gap-2">
                          {pkg.includes.split(",").map((inc, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-[#8B1A1A]/5 px-3 py-1.5 text-xs font-medium text-[#3a1a1a]/80">
                              <Check className="h-3 w-3 text-[#8B1A1A]" /> {inc.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between rounded-2xl bg-[#FBF7F1] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B1A1A]/10 text-[#8B1A1A]">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#3a1a1a]/40">Harga Paket</p>
                          <p className="text-lg font-bold text-[#8B1A1A]">{formatIDR(pkg.base_price_idr)}</p>
                        </div>
                      </div>
                      {(pkg.min_people || pkg.max_people) && (
                        <div className="flex items-center gap-2 text-[11px] font-medium text-[#3a1a1a]/50">
                          <Users className="h-3.5 w-3.5" />
                          {pkg.min_people && pkg.max_people ? `${pkg.min_people}-${pkg.max_people} orang` : pkg.max_people ? `Maks ${pkg.max_people}` : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add-ons */}
                {addons.length > 0 && (
                  <div className="overflow-hidden rounded-[32px] border border-[#8B1A1A]/10 bg-white shadow-sm">
                    <div className="border-b border-[#8B1A1A]/5 px-6 py-5">
                      <h3 className="text-lg font-bold text-[#1a0505]" style={{ fontFamily: "Fraunces, serif" }}>
                        Tambah <span className="italic text-[#8B1A1A]">Add-ons</span>
                      </h3>
                      <p className="text-xs text-[#3a1a1a]/50 mt-0.5">Opsional — tingkatkan pengalaman fotomu</p>
                    </div>
                    <div className="p-6 space-y-4">
                      {addons.map((addon) => {
                        const qty = selectedAddons[addon.id] ?? 0;
                        return (
                          <div key={addon.id} className="group flex items-center justify-between rounded-2xl border border-[#8B1A1A]/10 p-4 transition-all hover:border-[#8B1A1A]/25 hover:bg-[#FBF7F1]/50">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                <input
                                  type="checkbox"
                                  checked={qty > 0}
                                  onChange={(e) => toggleAddon(addon.id, e.target.checked)}
                                  className="h-5 w-5 rounded border-[#8B1A1A] text-[#8B1A1A] focus:ring-[#8B1A1A] accent-[#8B1A1A]"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#1a0505]">{addon.title}</p>
                                {addon.description && <p className="text-xs text-[#3a1a1a]/50 mt-0.5">{addon.description}</p>}
                                <p className="text-sm font-bold text-[#8B1A1A] mt-1">{formatIDR(addon.price_idr)}</p>
                              </div>
                            </div>
                            {qty > 0 && (
                              <div className="flex items-center gap-2">
                                <button onClick={() => setAddonQty(addon.id, qty - 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#8B1A1A]/30 text-[#8B1A1A] hover:bg-[#8B1A1A] hover:text-white transition-all">
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-6 text-center text-sm font-bold">{qty}</span>
                                <button
                                onClick={() => {
                                  if (qty < 20) {
                                    setAddonQty(addon.id, qty + 1);
                                  }
                                }}
                                disabled={qty >= 20}
                                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all
                                  ${
                                    qty >= 20
                                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                      : "border-[#8B1A1A]/30 text-[#8B1A1A] hover:bg-[#8B1A1A] hover:text-white"
                                  }`}
                              >
                                <Plus className="h-3.5 w-3.5" />
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

              {/* Right Column - Booking Form */}
              <div className="lg:col-span-5 space-y-6">
                {/* Date & Time Picker */}
                {needsSlot && (
                  <div className="overflow-hidden rounded-[32px] border border-[#8B1A1A]/10 bg-white shadow-sm">
                    <div className="border-b border-[#8B1A1A]/5 px-6 py-5">
                      <h3 className="text-lg font-bold text-[#1a0505]" style={{ fontFamily: "Fraunces, serif" }}>
                        Pilih <span className="italic text-[#8B1A1A]">Jadwal</span>
                      </h3>
                      <p className="text-xs text-[#3a1a1a]/50 mt-0.5">Jam operasional {intervalInfo} · 09.30 - 21.00</p>
                    </div>
                    <div className="p-6 space-y-5">
                      <div>
                        <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8B1A1A]">
                          <CalendarDays className="h-3.5 w-3.5" /> Tanggal
                        </label>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full rounded-2xl border border-[#8B1A1A]/20 bg-[#FBF7F1] px-4 py-3.5 text-sm font-medium text-[#1a0505] outline-none focus:border-[#8B1A1A] focus:ring-2 focus:ring-[#8B1A1A]/10 transition-all"
                        />
                      </div>

                      <div>
                        <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8B1A1A]">
                          <Clock4 className="h-3.5 w-3.5" /> Jam ({intervalLabel})
                        </label>
                        {loadingTimes ? (
                          <div className="flex items-center gap-3 py-4">
                            <Loader2 className="h-4 w-4 animate-spin text-[#8B1A1A]" />
                            <span className="text-sm text-[#3a1a1a]/60">Memuat jam tersedia...</span>
                          </div>
                        ) : availableSlots.length === 0 ? (
                          <p className="rounded-xl bg-[#FBF7F1] p-4 text-center text-sm text-[#3a1a1a]/50">Pilih tanggal untuk melihat jam tersedia.</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {availableSlots.map((slot) => (
                              <button
                                key={slot.time}
                                onClick={() => slot.available && setTime(slot.time)}
                                disabled={!slot.available}
                                className={[
                                  "relative rounded-xl border px-3 py-3 text-xs font-bold transition-all",
                                  time === slot.time
                                    ? "border-[#8B1A1A] bg-[#8B1A1A] text-white shadow-lg shadow-[#8B1A1A]/20"
                                    : slot.available
                                    ? "border-[#8B1A1A]/20 bg-white text-[#1a0505] hover:border-[#8B1A1A]/50 hover:bg-[#FBF7F1]"
                                    : "border-[#8B1A1A]/5 bg-[#FBF7F1]/50 text-[#3a1a1a]/30 cursor-not-allowed line-through",
                                ].join(" ")}
                              >
                                {slot.time.replace("-", " - ")}
                                {slot.available && time !== slot.time && (
                                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-green-500" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="overflow-hidden rounded-[32px] border border-[#8B1A1A]/10 bg-white shadow-sm">
                  <div className="border-b border-[#8B1A1A]/5 px-6 py-5">
                    <h3 className="text-lg font-bold text-[#1a0505]" style={{ fontFamily: "Fraunces, serif" }}>
                      Ringkasan <span className="italic text-[#8B1A1A]">Pesanan</span>
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#3a1a1a]/60">{pkg.title}</span>
                      <span className="font-bold">{formatIDR(pkg.base_price_idr)}</span>
                    </div>
                    {Object.entries(selectedAddons).map(([addonId, qty]) => {
                      const addon = addons.find((a) => a.id === addonId);
                      if (!addon || qty <= 0) return null;
                      return (
                        <div key={addonId} className="flex items-center justify-between text-sm">
                          <span className="text-[#3a1a1a]/60">{addon.title} <span className="text-[#8B1A1A]">x{qty}</span></span>
                          <span className="font-bold">{formatIDR(addon.price_idr * qty)}</span>
                        </div>
                      );
                    })}
                    <div className="pt-4 border-t border-dashed border-[#8B1A1A]/20">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1a0505]">Total</span>
                        <span className="text-2xl font-bold text-[#8B1A1A]" style={{ fontFamily: "Fraunces, serif" }}>
                          {formatIDR(grandTotal)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={submit}
                      disabled={submitting || (!isAuthed) || (needsSlot && (!date || !time))}
                      className="mt-2 w-full flex items-center justify-center gap-3 bg-[#8B1A1A] text-white py-4 rounded-2xl font-bold text-sm transition-all hover:bg-[#6B1212] hover:shadow-lg hover:shadow-[#8B1A1A]/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                      {submitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</>
                      ) : !isAuthed ? (
                        <>Login untuk Booking</>
                      ) : needsSlot && (!date || !time) ? (
                        <><Clock4 className="h-4 w-4" /> Pilih Jadwal Dulu</>
                      ) : (
                        <><ShieldCheck className="h-4 w-4" /> Konfirmasi Booking <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>

                    <p className="text-center text-[11px] text-[#3a1a1a]/40 italic">
                      Pembayaran dilakukan di studio setelah sesi foto.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[32px] border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
              Paket tidak ditemukan.
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
