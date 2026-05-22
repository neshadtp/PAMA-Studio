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
  AlertCircle,
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
  package_resources?: Array<{
    resources: {
      id: string;
      code: string;
      name: string;
      background_options?: Record<string, string[]>;
    };
  }>;
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

type DateOption = {
  date: string;
  availableCount: number;
  totalSlots: number;
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

function getStudioBadge(type: string, title: string): { label: string; color: string } {
  const t = title.toLowerCase();
  if (t.includes("studio 1")) return { label: "Self Photo Studio 1", color: "bg-amber-100 text-amber-700" };
  if (t.includes("studio 2") && t.includes("molding")) return { label: "Studio 2 Molding", color: "bg-purple-100 text-purple-700" };
  if (t.includes("studio 2")) return { label: "Self Photo Studio 2", color: "bg-blue-100 text-blue-700" };
  if (type === "pas_foto") return { label: "Pas Foto", color: "bg-green-100 text-green-700" };
  if (type === "photographer") return { label: "Jasa Fotografer", color: "bg-rose-100 text-rose-700" };
  return { label: "Paket", color: "bg-gray-100 text-gray-700" };
}

function toDateKey(date: Date) {
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const year = wib.getUTCFullYear();
  const month = String(wib.getUTCMonth() + 1).padStart(2, "0");
  const day = String(wib.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateOption(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatCategoryLabel(key: string): string {
  if (key === "studio1") return "Studio 1";
  if (key === "studio2") return "Studio 2";
  if (key === "studio3") return "Studio 3";
  if (key === "studio2molding") return "Studio 2 Molding";
  if (key === "pasfoto") return "Pas Foto";
  return key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase()).trim();
}

function getBgColorExtended(color: string) {
  const c = color.toLowerCase();
  
  if (c.includes("abstrak abu")) {
    return {
      swatch: "bg-gradient-to-b from-[#a6a6a6] via-[#7d7d7d] to-[#595959] border-[#666666] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]",
      glow: "hover:shadow-xl hover:shadow-neutral-500/30 hover:border-neutral-500",
      selectedGlow: "shadow-xl shadow-neutral-600/40 border-[#8B1A1A]",
      extra: null
    };
  }
  if (c.includes("abstrak pink")) {
    return {
      swatch: "bg-gradient-to-b from-[#e09fa2] via-[#c2787b] to-[#9c5659] border-[#9c5659] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]",
      glow: "hover:shadow-xl hover:shadow-rose-400/20 hover:border-rose-400",
      selectedGlow: "shadow-xl shadow-rose-500/30 border-[#8B1A1A]",
      extra: null
    };
  }
  if (c.includes("noir") || c.includes("bw")) {
    return {
      swatch: "bg-gradient-to-b from-zinc-500 via-zinc-800 to-zinc-950 border-zinc-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]",
      glow: "hover:shadow-xl hover:shadow-zinc-900/40 hover:border-zinc-700",
      selectedGlow: "shadow-xl shadow-zinc-950/50 border-[#8B1A1A]",
      extra: null
    };
  }
  if (c.includes("maple")) {
    return {
      swatch: "bg-gradient-to-b from-[#d97706] via-[#b45309] to-[#78350f] border-[#78350f] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]",
      glow: "hover:shadow-xl hover:shadow-amber-700/20 hover:border-amber-700",
      selectedGlow: "shadow-xl shadow-amber-700/30 border-[#8B1A1A]",
      extra: null
    };
  }
  if (c.includes("amber")) {
    return {
      swatch: "bg-gradient-to-b from-[#fbbf24] via-[#d97706] to-[#92400e] border-[#92400e] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]",
      glow: "hover:shadow-xl hover:shadow-amber-500/20 hover:border-amber-600",
      selectedGlow: "shadow-xl shadow-amber-600/30 border-[#8B1A1A]",
      extra: null
    };
  }

  if (c.includes("putih")) {
    return {
      swatch: "bg-gradient-to-b from-white via-neutral-50 to-neutral-200 border-neutral-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]",
      glow: "hover:shadow-xl hover:shadow-neutral-200/50 hover:border-neutral-400",
      selectedGlow: "shadow-xl shadow-neutral-200/60 border-[#8B1A1A]",
      extra: null
    };
  }
  if (c.includes("abu")) {
    return {
      swatch: "bg-gradient-to-b from-[#d2d2d2] via-[#b0b0b0] to-[#8f8f8f] border-[#8a8a8a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]",
      glow: "hover:shadow-xl hover:shadow-neutral-400/40 hover:border-neutral-500",
      selectedGlow: "shadow-xl shadow-neutral-400/50 border-[#8B1A1A]",
      extra: null
    };
  }
  if (c.includes("orange") || c.includes("oranye")) {
    return {
      swatch: "bg-gradient-to-b from-[#f3995d] via-[#e07b39] to-[#bc5e20] border-[#c05e1e] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]",
      glow: "hover:shadow-xl hover:shadow-orange-500/20 hover:border-orange-500",
      selectedGlow: "shadow-xl shadow-orange-500/30 border-[#8B1A1A]",
      extra: null
    };
  }
  if (c.includes("ungu")) {
    return {
      swatch: "bg-gradient-to-b from-[#a487d3] via-[#8b6bba] to-[#6d4f9c] border-[#6d4d9c] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]",
      glow: "hover:shadow-xl hover:shadow-purple-500/20 hover:border-purple-500",
      selectedGlow: "shadow-xl shadow-purple-500/30 border-[#8B1A1A]",
      extra: null
    };
  }
  if (c.includes("hijau")) {
    return {
      swatch: "bg-gradient-to-b from-[#669d6a] via-[#4e8252] to-[#39633c] border-[#39633c] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]",
      glow: "hover:shadow-xl hover:shadow-emerald-600/20 hover:border-emerald-600",
      selectedGlow: "shadow-xl shadow-emerald-500/30 border-[#8B1A1A]",
      extra: null
    };
  }
  if (c.includes("coklat") || c.includes("cokelat")) {
    return {
      swatch: "bg-gradient-to-b from-[#9d7d65] via-[#82624a] to-[#634833] border-[#634833] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]",
      glow: "hover:shadow-xl hover:shadow-amber-950/20 hover:border-amber-800",
      selectedGlow: "shadow-xl shadow-amber-850/30 border-[#8B1A1A]",
      extra: null
    };
  }
  if (c.includes("pink")) {
    return {
      swatch: "bg-gradient-to-b from-[#f5b3b5] via-[#e5989b] to-[#c37b7e] border-[#c37b7e] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]",
      glow: "hover:shadow-xl hover:shadow-rose-400/20 hover:border-rose-400",
      selectedGlow: "shadow-xl shadow-rose-450/30 border-[#8B1A1A]",
      extra: null
    };
  }
  if (c.includes("molding")) {
    return {
      swatch: "bg-gradient-to-b from-[#ebdcc7] via-[#c8bba8] to-[#a39582] border-[#8c7f6d] relative overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]",
      glow: "hover:shadow-xl hover:shadow-amber-800/15 hover:border-[#ab9c86]",
      selectedGlow: "shadow-xl shadow-[#ab9c86]/40 border-[#8B1A1A]",
      extra: (
        <div className="absolute inset-0 flex justify-around py-2 px-3 pointer-events-none">
          <div className="w-[1px] h-full bg-white/20 shadow-[1px_0_0_rgba(0,0,0,0.05)]" />
          <div className="w-[1px] h-full bg-white/20 shadow-[1px_0_0_rgba(0,0,0,0.05)]" />
        </div>
      ),
    };
  }

  if (c.includes("merah")) {
    return {
      swatch: "bg-gradient-to-b from-[#ff4d4d] via-[#cc0000] to-[#990000] border-[#990000] shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]",
      glow: "hover:shadow-xl hover:shadow-red-600/20 hover:border-red-500",
      selectedGlow: "shadow-xl shadow-red-600/30 border-[#8B1A1A]",
      extra: null
    };
  }
  if (c.includes("biru")) {
    return {
      swatch: "bg-gradient-to-b from-[#4da6ff] via-[#0066cc] to-[#004499] border-[#004499] shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]",
      glow: "hover:shadow-xl hover:shadow-blue-600/20 hover:border-blue-500",
      selectedGlow: "shadow-xl shadow-blue-600/30 border-[#8B1A1A]",
      extra: null
    };
  }

  return {
    swatch: "bg-gradient-to-b from-neutral-200 via-neutral-400 to-neutral-500 border-neutral-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]",
    glow: "hover:shadow-xl hover:shadow-neutral-400/20 hover:border-neutral-400",
    selectedGlow: "shadow-xl shadow-neutral-500/30 border-[#8B1A1A]",
    extra: null
  };
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

  const [date, setDate] = useState<string>(() => toDateKey(new Date()));

  const [availableSlots, setAvailableSlots] = useState<SlotInfo[]>([]);
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const [dateOptionsLoading, setDateOptionsLoading] = useState(false);
  const [time, setTime] = useState<string>("");
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [selectedBg, setSelectedBg] = useState<string>("");

  // ==================== METADATA SINKRONISASI LOGIKA INTERVAL (SUPABASE) ====================
  const timingInfo = useMemo(() => {
    if (!pkg?.package_resources || pkg.package_resources.length === 0) {
      return { intervalLabel: "30 menit", requiresAdmin: false };
    }

    const resourceCode = pkg.package_resources[0].resources?.code;

    if (resourceCode === "studio1" || resourceCode === "pasfoto") {
      return { intervalLabel: "30 menit", requiresAdmin: false };
    }
    if (resourceCode === "studio2" || resourceCode === "studio2molding") {
      return { intervalLabel: "60 menit (1 jam)", requiresAdmin: false };
    }
    if (resourceCode === "jasafotografer") {
      return { intervalLabel: "Jadwal Admin", requiresAdmin: true };
    }

    return { intervalLabel: "30 menit", requiresAdmin: false };
  }, [pkg]);

  const backgroundOptions = useMemo(() => {
    if (!pkg?.package_resources) return null;
    
    const options: Record<string, string[]> = {};
    let hasOptions = false;
    
    pkg.package_resources.forEach(pr => {
      const bo = pr.resources?.background_options;
      if (bo && typeof bo === 'object') {
        Object.entries(bo).forEach(([category, colors]) => {
          if (Array.isArray(colors) && colors.length > 0) {
            options[category] = Array.from(new Set([
              ...(options[category] || []),
              ...colors
            ]));
            hasOptions = true;
          }
        });
      }
    });
    
    return hasOptions ? options : null;
  }, [pkg]);

  const duration = pkg?.duration_minutes ?? 0;
  // Jika paket memerlukan admin (Jasa Fotografer), kita buat needsSlot = false agar date-time picker tidak ter-render
  const needsSlot = duration > 0 && !timingInfo.requiresAdmin;

  const filteredAddons = useMemo(() => {
    if (!pkg || addons.length === 0) return [];
    
    return addons.filter((addon) => {
      const addonTitle = addon.title.toLowerCase();
      const packageType = pkg.type;

      if (addonTitle.includes("fotografer") && packageType !== "photographer") {
        return false;
      }
      if (packageType === "photographer" && (addonTitle.includes("self photo") || addonTitle.includes("pas foto"))) {
        return false;
      }
      if (addonTitle.includes("self photo") && packageType !== "self_photo") {
        return false;
      }
      if (addonTitle.includes("pas foto") && packageType !== "pas_foto") {
        return false;
      }

      return true;
    });
  }, [addons, pkg]);

  const addonsTotal = useMemo(() => {
    let total = 0;
    for (const a of filteredAddons) {
      const qty = selectedAddons[a.id] ?? 0;
      if (qty > 0) total += a.price_idr * qty;
    }
    return total;
  }, [filteredAddons, selectedAddons]);

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

  useEffect(() => {
    if (!pkg || addons.length === 0) return;
    
    setSelectedAddons((prev) => {
      const next = { ...prev };
      let hasChanged = false;

      Object.keys(next).forEach((addonId) => {
        const addon = addons.find((a) => a.id === addonId);
        if (addon) {
          const titleLower = addon.title.toLowerCase();
          if (titleLower.includes("fotografer") && pkg.type !== "photographer") {
            delete next[addonId];
            hasChanged = true;
          }
          if (pkg.type === "photographer" && (titleLower.includes("self photo") || titleLower.includes("pas foto"))) {
            delete next[addonId];
            hasChanged = true;
          }
        }
      });

      return hasChanged ? next : prev;
    });
  }, [pkg?.type, addons]);

  const loadAvailability = useCallback(async (targetDate: string) => {
    if (!packageId || !pkg || !needsSlot) return;

    setErr("");
    setLoadingTimes(true);
    setAvailableSlots([]);
    setTime("");

    try {
      const res = await fetch(
        `/api/availability/by-package?packageId=${encodeURIComponent(packageId)}&date=${encodeURIComponent(targetDate)}`
      );

      const data = await res.json();
      if (!res.ok) {
        setErr(data?.message ?? "Gagal load jam tersedia");
        return;
      }
      setAvailableSlots((data.slots ?? data.available ?? []) as SlotInfo[]);
      setIntervalInfo(data.interval ? `Interval ${data.interval} menit` : `Interval ${timingInfo.intervalLabel}`);
    } catch {
      setErr("Gagal load jam tersedia");
    } finally {
      setLoadingTimes(false);
    }
  }, [packageId, pkg, needsSlot, timingInfo.intervalLabel]);

  const loadDateOptions = useCallback(async () => {
    if (!packageId || !pkg || !needsSlot) return;

    setDateOptionsLoading(true);

    try {
      const base = new Date();
      const dates = Array.from({ length: 14 }, (_, index) => {
        const next = new Date(base);
        next.setDate(base.getDate() + index);
        return toDateKey(next);
      });

      const results = await Promise.all(dates.map(async (targetDate) => {
        const res = await fetch(
          `/api/availability/by-package?packageId=${encodeURIComponent(packageId)}&date=${encodeURIComponent(targetDate)}`
        );

        const data = await res.json();
        const slots = (data.slots ?? data.available ?? []) as SlotInfo[];
        const availableCount = slots.filter((slot) => slot.available).length;

        return {
          date: targetDate,
          availableCount,
          totalSlots: slots.length,
        } satisfies DateOption;
      }));

      setDateOptions(results);
    } catch (error) {
      console.error("Date options load error:", error);
    } finally {
      setDateOptionsLoading(false);
    }
  }, [packageId, pkg, needsSlot]);

  const handleAuthSuccess = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setIsAuthed(true);
        setUserData(data.user);
        setAuthOpen(false);
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
      } catch (error) {
        console.error("Checkout auth init error:", error);
        setIsAuthed(false);
        setUserData(null);
        setSessionReady(true);
        setAuthOpen(true);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (pkg && needsSlot) loadAvailability(date);
  }, [pkg, needsSlot, date, loadAvailability]);

  useEffect(() => {
    if (pkg && needsSlot) loadDateOptions();
  }, [pkg, needsSlot, loadDateOptions]);

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
    if (backgroundOptions && !selectedBg) { setErr("Pilih background dulu."); return; }

    setSubmitting(true);
    try {
      const payload = {
        packageId,
        date: timingInfo.requiresAdmin ? toDateKey(new Date()) : date,
        time: timingInfo.requiresAdmin ? "Jadwal Admin" : time,
        notes: [
          selectedBg ? `Background: ${selectedBg}` : "",
          timingInfo.requiresAdmin ? "Kategori khusus Jasa Fotografer: Perlu Konsultasi Mandiri Tim Lapangan" : ""
        ].filter(Boolean).join(" | "),
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
        date: timingInfo.requiresAdmin ? "Custom Jadwal" : date,
        time: timingInfo.requiresAdmin ? "Konsultasi Admin" : time,
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
        <div className="pointer-events-none absolute -top-16 -right-16 h-[260px] w-[260px] rounded-full bg-[#8B1A1A]/8 blur-[120px] sm:-top-20 sm:-right-20 sm:h-[320px] sm:w-[320px] lg:h-[400px] lg:w-[400px]" />
        <div className="pointer-events-none absolute top-40 -left-14 h-[200px] w-[200px] rounded-full bg-[#D4A373]/12 blur-[100px] sm:-left-20 sm:h-[250px] sm:w-[250px] lg:h-[300px] lg:w-[300px]" />

        <div className="page-shell max-w-6xl px-5 py-10 mx-auto lg:py-16">
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
                    <Image src="/images/foto-pama.webp" alt={pkg.title} fill className="media-safe object-cover opacity-40 mix-blend-overlay" unoptimized />
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <div className="flex items-center gap-2 mb-2">
                        {studioBadge && (
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${studioBadge.color}`}>
                            {studioBadge.label}
                          </span>
                        )}
                        {/* FOTO 1 PERBAIKAN: Jika paket Jasa Fotografer, sembunyikan durasi teks sesi foto seluruhnya */}
                        {!timingInfo.requiresAdmin && duration > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                            <Timer className="h-3 w-3" /> {duration} menit sesi foto
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

                {/* Premium Background Options Picker */}
                {backgroundOptions && (
                  <div className="overflow-hidden rounded-[32px] border border-[#8B1A1A]/10 bg-white shadow-[0_4px_20px_rgba(139,26,26,0.02)]">
                    <div className="border-b border-[#8B1A1A]/5 px-8 py-6">
                      <h3 className="text-xl font-medium tracking-tight text-[#1a0505]" style={{ fontFamily: "Fraunces, serif" }}>
                        Pilih <span className="italic text-[#8B1A1A] font-normal">Warna Background</span>
                      </h3>
                      <p className="text-xs text-[#3a1a1a]/50 mt-1 font-light tracking-wide">Silakan pilih opsi warna latar belakang foto Anda</p>
                    </div>
                    
                    <div className="p-8 space-y-8">
                      {Object.entries(backgroundOptions).map(([category, colors]) => {
                        const isSingleCategory = Object.keys(backgroundOptions).length === 1;
                        return (
                          <div key={category} className="space-y-4">
                            {!isSingleCategory && (
                              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8B1A1A]/70 mb-2">
                                {formatCategoryLabel(category)}
                              </h4>
                            )}
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                              {colors.map((color) => {
                                const val = isSingleCategory ? color : `${formatCategoryLabel(category)} - ${color}`;
                                const isSelected = selectedBg === val;
                                const styleInfo = getBgColorExtended(color);
                                
                                return (
                                  <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedBg(val)}
                                    className={`group relative flex flex-col items-center rounded-2xl border p-5 text-center transition-all duration-300 ease-out outline-none ${
                                      isSelected
                                        ? `border-[#8B1A1A] bg-neutral-50/50 shadow-md translate-y-[-4px] ${styleInfo.selectedGlow}`
                                        : `border-neutral-100 bg-white hover:border-neutral-200 hover:-translate-y-1 ${styleInfo.glow}`
                                    }`}
                                  >
                                    <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
                                      <div className={`h-full w-full rounded-2xl border shadow-inner transition-transform duration-500 ease-out group-hover:scale-105 ${styleInfo.swatch}`}>
                                        {styleInfo.extra}
                                      </div>
                                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none mix-blend-overlay" />
                                    </div>
                                    
                                    <span className={`text-xs font-medium tracking-wide transition-colors duration-300 ${
                                      isSelected ? "text-[#8B1A1A] font-semibold" : "text-neutral-500 group-hover:text-neutral-800"
                                    }`}>
                                      {color}
                                    </span>
                                    
                                    <div className={`absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-300 ${
                                      isSelected 
                                        ? "bg-[#8B1A1A] border-[#8B1A1A] scale-100 opacity-100 rotate-0" 
                                        : "border-neutral-200 bg-white scale-75 opacity-0 rotate-45 group-hover:opacity-40"
                                    }`}>
                                      <Check className={`h-2.5 w-2.5 text-white stroke-[3.5px] transition-transform duration-300 ${isSelected ? "scale-100" : "scale-50"}`} />
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Filtered Add-ons Render */}
                {filteredAddons.length > 0 && (
                  <div className="overflow-hidden rounded-[32px] border border-[#8B1A1A]/10 bg-white shadow-sm">
                    <div className="border-b border-[#8B1A1A]/5 px-6 py-5">
                      <h3 className="text-lg font-bold text-[#1a0505]" style={{ fontFamily: "Fraunces, serif" }}>
                        Tambah <span className="italic text-[#8B1A1A]">Add-ons</span>
                      </h3>
                      <p className="text-xs text-[#3a1a1a]/50 mt-0.5">Opsional — tingkatkan pengalaman fotomu</p>
                    </div>
                    <div className="p-6 space-y-4">
                      {filteredAddons.map((addon) => {
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
                
                {/* Panel Alert Konsultasi Jasa Fotografer */}
                {timingInfo.requiresAdmin && (
                  <div className="rounded-[32px] border border-amber-200 bg-amber-50/70 p-6 space-y-3 shadow-sm backdrop-blur-sm">
                    <div className="flex items-start gap-2.5 text-amber-800">
                      <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-bold text-sm">Alert Konsultasi Admin</h4>
                        <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                          Penentuan jam untuk paket <strong>Jasa Fotografer</strong> wajib dikonsultasikan secara langsung via admin WhatsApp demi menjamin ketersediaan kru lapangan. Silakan selesaikan pengisian lembar konfirmasi terlebih dahulu.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Date & Time Picker */}
                {needsSlot && (
                  <div className="overflow-hidden rounded-[32px] border border-[#8B1A1A]/10 bg-white shadow-sm">
                    <div className="border-b border-[#8B1A1A]/5 px-6 py-5">
                      <h3 className="text-lg font-bold text-[#1a0505]" style={{ fontFamily: "Fraunces, serif" }}>
                        Pilih <span className="italic text-[#8B1A1A]">Jadwal</span>
                      </h3>
                      {/* FOTO 2 PERBAIKAN: Pas Foto otomatis menampilkan text '30 menit booking ruangannya' karena terikat room interval database */}
                      <p className="text-xs text-[#3a1a1a]/50 mt-0.5">Jam operasional ({timingInfo.intervalLabel} booking ruangannya) · 09.30 - 21.00</p>
                    </div>
                    <div className="p-6 space-y-5">
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8B1A1A]">
                            <CalendarDays className="h-3.5 w-3.5" /> Tanggal
                          </label>
                          <span className="text-[11px] font-medium text-[#3a1a1a]/45">14 hari ke depan</span>
                        </div>

                        {dateOptionsLoading ? (
                          <div className="flex items-center gap-3 rounded-2xl border border-[#8B1A1A]/10 bg-[#FBF7F1] px-4 py-5 text-sm text-[#3a1a1a]/60">
                            <Loader2 className="h-4 w-4 animate-spin text-[#8B1A1A]" />
                            Memuat tanggal tersedia...
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {dateOptions.map((option) => {
                              const isSelected = date === option.date;
                              const isAvailable = option.availableCount > 0;

                              return (
                                <button
                                  key={option.date}
                                  type="button"
                                  onClick={() => {
                                    if (!isAvailable) return;
                                    setDate(option.date);
                                  }}
                                  disabled={!isAvailable}
                                  className={`relative rounded-2xl border p-3 text-left transition-all ${
                                    isSelected
                                      ? "border-[#8B1A1A] bg-[#8B1A1A] text-white shadow-lg shadow-[#8B1A1A]/20"
                                      : isAvailable
                                        ? "border-[#8B1A1A]/15 bg-white text-[#1a0505] hover:border-[#8B1A1A]/35 hover:bg-[#FBF7F1]"
                                        : "cursor-not-allowed border-[#8B1A1A]/5 bg-[#FBF7F1] text-[#3a1a1a]/35 opacity-70"
                                  }`}
                                >
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                                    {formatDateOption(option.date)}
                                  </p>
                                  <p className={`mt-1 text-lg font-black ${isSelected ? "text-white" : ""}`}>
                                    {option.date.slice(8, 10)}
                                  </p>
                                  <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider">
                                    <span className={isSelected ? "text-white/70" : "text-[#3a1a1a]/45"}>
                                      {isAvailable ? `${option.availableCount} slot` : "Penuh"}
                                    </span>
                                    <span className={`rounded-full px-2 py-0.5 ${isSelected ? "bg-white/15 text-white" : isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-500"}`}>
                                      {isAvailable ? "Tersedia" : "Tutup"}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div>
                        {/* FOTO 2: Label penunjuk alokasi jam booking ruangannya */}
                        <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8B1A1A]">
                          <Clock4 className="h-3.5 w-3.5" /> Jam ({timingInfo.intervalLabel} booking ruangannya)
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
                                type="button"
                                onClick={() => slot.available && setTime(slot.time)}
                                disabled={!slot.available}
                                className={[
                                  "relative rounded-xl border px-3 py-3 text-xs font-bold transition-all",
                                  time === slot.time
                                    ? "border-[#8B1A1A] bg-[#8B1A1A] text-white shadow-lg shadow-[#8B1A1A]/20"
                                    : slot.available
                                      ? "border-[#8B1A1A]/20 bg-white text-[#1a0505] hover:border-[#8B1A1A]/50 hover:bg-[#FBF7F1]"
                                      : "border-[#8B1A1A]/5 bg-[#FBF7F1]/50 text-[#3a1a1a]/30 cursor-not-allowed",
                                ].join(" ")}
                              >
                                <span>{slot.time.replace("-", " - ")}</span>
                                {slot.available ? (
                                  time !== slot.time && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-green-500" />
                                ) : (
                                  <span className="absolute right-2 top-2 rounded-full bg-[#8B1A1A]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#8B1A1A]/40">Penuh</span>
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
                      disabled={submitting || (!isAuthed) || (needsSlot && (!date || !time)) || (!!backgroundOptions && !selectedBg)}
                      className="mt-2 w-full flex items-center justify-center gap-3 bg-[#8B1A1A] text-white py-4 rounded-2xl font-bold text-sm transition-all hover:bg-[#6B1212] hover:shadow-lg hover:shadow-[#8B1A1A]/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                      {submitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</>
                      ) : !isAuthed ? (
                        <>Login untuk Booking</>
                      ) : timingInfo.requiresAdmin ? (
                        <><ShieldCheck className="h-4 w-4" /> Ambil Sesi & Hubungi Admin</>
                      ) : needsSlot && (!date || !time) ? (
                        <><Clock4 className="h-4 w-4" /> Pilih Jadwal Dulu</>
                      ) : backgroundOptions && !selectedBg ? (
                        <><ImageIcon className="h-4 w-4" /> Pilih Background Dulu</>
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