"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Users, ShoppingBag, Clock, CheckCircle,
  ArrowUpRight, Loader2, AlertCircle, ChevronLeft, ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

function formatIDR(n: number) {
  return "Rp " + new Intl.NumberFormat("id-ID").format(n);
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  awaiting_payment: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  scheduled: "bg-purple-100 text-purple-700",
  in_progress: "bg-cyan-100 text-cyan-700",
  done: "bg-green-50 text-green-600",
  cancelled: "bg-red-100 text-red-600",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu",
  awaiting_payment: "Menunggu Bayar",
  paid: "Dibayar",
  scheduled: "Terjadwal",
  in_progress: "Berlangsung",
  done: "Selesai",
  cancelled: "Dibatalkan",
};

const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const HARI = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

type CalendarOrder = {
  id: string;
  status: string;
  scheduled_at: string;
  total_price_idr: number;
  profiles: { full_name: string | null } | null;
  packages: { title: string | null } | null;
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function MiniCalendar() {
  const [current, setCurrent] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<CalendarOrder[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  useEffect(() => {
    let active = true;

    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/calendar?year=${year}&month=${month + 1}`);
        if (!res.ok) {
          return;
        }

        const data = await res.json();
        if (active) {
          setOrders((data.orders ?? []) as CalendarOrder[]);
        }
      } catch (error) {
        console.error("Calendar fetch error:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchCalendar();
    return () => {
      active = false;
    };
  }, [month, year]);

  const ordersByDate = useMemo(() => {
    const map = new Map<string, CalendarOrder[]>();

    for (const order of orders) {
      const dateKey = toDateKey(new Date(order.scheduled_at));
      const currentOrders = map.get(dateKey) ?? [];
      currentOrders.push(order);
      map.set(dateKey, currentOrders);
    }

    return map;
  }, [orders]);

  const todayKey = toDateKey(new Date());
  const selectedOrders = ordersByDate.get(selectedDate) ?? [];
  const selectedLabel = formatDateLabel(selectedDate);

  return (
    <div className="bg-white rounded-3xl border border-[#8B1A1A]/10 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-[#8B1A1A]/5 rounded-full transition-colors">
          <ChevronLeft size={16} className="text-[#3a1a1a]/60" />
        </button>
        <span className="font-bold text-[#1a0505]">{BULAN[month]} {year}</span>
        <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-[#8B1A1A]/5 rounded-full transition-colors">
          <ChevronRight size={16} className="text-[#3a1a1a]/60" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {HARI.map((day) => <div key={day} className="text-[10px] font-bold text-[#3a1a1a]/40 py-1">{day}</div>)}
        {cells.map((d, i) => {
          if (!d) {
            return <div key={`empty-${i}`} className="h-20 rounded-2xl" />;
          }

          const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const dayOrders = ordersByDate.get(dateKey) ?? [];
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDate;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedDate(dateKey)}
              className={`relative flex h-20 flex-col items-start rounded-2xl border p-2 text-left transition-all ${
                isSelected
                  ? "border-[#8B1A1A] bg-[#8B1A1A] text-white shadow-lg shadow-[#8B1A1A]/15"
                  : dayOrders.length > 0
                    ? "border-[#8B1A1A]/15 bg-[#FBF7F1] text-[#1a0505] hover:border-[#8B1A1A]/30 hover:bg-[#8B1A1A]/5"
                    : "border-[#8B1A1A]/10 bg-white text-[#3a1a1a]/70 hover:border-[#8B1A1A]/25 hover:bg-[#FBF7F1]"
              }`}
            >
              <span className={`text-xs font-semibold ${isToday && !isSelected ? "text-[#8B1A1A]" : ""}`}>{d}</span>
              <span className={`mt-0.5 text-[10px] ${isSelected ? "text-white/80" : "text-[#3a1a1a]/45"}`}>
                {dayOrders.length > 0 ? `${dayOrders.length} order` : "Kosong"}
              </span>
              <div className="mt-auto w-full flex items-center justify-between gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wide ${isSelected ? "text-white/70" : "text-[#3a1a1a]/35"}`}>
                  {dayOrders.length > 0 ? "Tasks" : "Free"}
                </span>
                {dayOrders.length > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isSelected ? "bg-white/15 text-white" : "bg-[#8B1A1A]/10 text-[#8B1A1A]"}`}>
                    {dayOrders.length}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl bg-[#FBF7F1] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B1A1A]">{selectedLabel}</p>
            <p className="text-sm font-semibold text-[#1a0505]">{selectedOrders.length > 0 ? `${selectedOrders.length} order terjadwal` : "Tidak ada order pada tanggal ini"}</p>
          </div>
          {loading && <Loader2 size={14} className="animate-spin text-[#8B1A1A]" />}
        </div>

        <div className="mt-4 space-y-3">
          {selectedOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#8B1A1A]/15 bg-white px-4 py-5 text-sm text-[#3a1a1a]/50">
              Tanggal ini belum memiliki order.
            </div>
          ) : (
            selectedOrders.slice(0, 4).map((order) => (
              <div key={order.id} className="rounded-xl border border-[#8B1A1A]/10 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#1a0505]">{order.profiles?.full_name ?? "Customer"}</p>
                    <p className="truncate text-xs text-[#3a1a1a]/50">{order.packages?.title ?? "Paket"}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[order.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-[#3a1a1a]/55">
                  <span>{new Date(order.scheduled_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span>{formatIDR(order.total_price_idr)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-[#8B1A1A]/10 p-6 shadow-sm hover:shadow-md hover:border-[#8B1A1A]/20 transition-all"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
        {icon}
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-[#3a1a1a]/40 mb-1">{label}</p>
      <p className="text-3xl font-black text-[#1a0505] tracking-tight">{value}</p>
    </motion.div>
  );
}

type RecentOrder = {
  id: string;
  status: string;
  total_price_idr: number;
  created_at: string;
  profiles: { full_name: string | null } | null;
  packages: { title: string | null } | null;
};

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("Admin");
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, pendingOrders: 0, doneOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [packageStats, setPackageStats] = useState<{ id: string; title: string; count: number; total: number }[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          router.push("/");
          return;
        }
        const data = await res.json();
        if (data.profile?.role !== "admin") {
          router.push("/");
          return;
        }
        setIsAdmin(true);
        setAdminName(data.profile?.full_name || "Admin");
        fetchData();
      } catch (error) {
        console.error("Admin check error:", error);
        router.push("/");
      }
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/orders"),
        ]);

        if (!statsRes.ok || !ordersRes.ok) {
          console.error("Failed to fetch admin data");
          return;
        }

        const statsData = await statsRes.json();
        const ordersData = await ordersRes.json();

        setStats(statsData.stats);
        setPackageStats(statsData.packageStats);
        setRecentOrders(ordersData.orders);
      } catch (error) {
        console.error("Fetch data error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FBF7F1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#8B1A1A]" />
          <p className="text-[#3a1a1a]/60 font-medium">Memverifikasi akses admin...</p>
        </div>
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-[#8B1A1A]" size={32} />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B1A1A]">Dashboard</span>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1a0505] mt-1" style={{ fontFamily: "Fraunces, serif" }}>
            Selamat datang, <span className="italic text-[#8B1A1A]">{adminName}</span>!
          </h1>
          <p className="text-sm text-[#3a1a1a]/50 mt-1">{todayStr}</p>
        </div>
        <a
          href="/admin/operational"
          className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[#8B1A1A] text-white text-sm font-semibold rounded-full hover:bg-[#6B1212] transition-all"
        >
          Lihat Pesanan <ArrowRight size={16} />
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <StatCard
          label="User Aktif"
          value={stats.totalUsers}
          icon={<Users size={24} />}
          color="bg-[#8B1A1A]/10 text-[#8B1A1A]"
        />
        <StatCard
          label="Total Booking"
          value={stats.totalOrders}
          icon={<ShoppingBag size={24} />}
          color="bg-blue-50 text-blue-500"
        />
        <StatCard
          label="Pesanan Diproses"
          value={stats.pendingOrders}
          icon={<Clock size={24} />}
          color="bg-amber-50 text-amber-500"
        />
        <StatCard
          label="Sesi Selesai"
          value={stats.doneOrders}
          icon={<CheckCircle size={24} />}
          color="bg-green-50 text-green-600"
        />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#8B1A1A]/10 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#8B1A1A]/10">
            <div>
              <h2 className="font-bold text-[#1a0505]">Aktivitas Terbaru</h2>
              <p className="text-xs text-[#3a1a1a]/50 mt-0.5">Update pesanan terbaru</p>
            </div>
            <a href="/admin/operational" className="flex items-center gap-1 text-xs text-[#8B1A1A] font-semibold hover:opacity-70 transition-opacity">
              Lihat Semua <ArrowUpRight size={12} />
            </a>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#3a1a1a]/30">
              <AlertCircle size={32} className="mb-3" />
              <p className="text-sm font-medium">Belum ada aktivitas</p>
              <a href="/paket" className="mt-4 text-xs text-[#8B1A1A] font-semibold hover:underline">Lihat paket tersedia</a>
            </div>
          ) : (
            <div className="divide-y divide-[#8B1A1A]/5">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#FBF7F1]/50 transition-colors">
                  <div className="w-10 h-10 rounded-2xl bg-[#8B1A1A]/10 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag size={18} className="text-[#8B1A1A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1a0505] truncate">
                      {order.profiles?.full_name ?? "Customer"} — {order.packages?.title ?? "-"}
                    </p>
                    <p className="text-xs text-[#3a1a1a]/40 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[order.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                    <span className="text-sm font-semibold text-[#1a0505]">{formatIDR(order.total_price_idr)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <MiniCalendar />

          <div className="bg-white rounded-3xl border border-[#8B1A1A]/10 shadow-sm p-6">
            <h2 className="font-bold text-[#1a0505] mb-4">Paket Populer</h2>
            {packageStats.length === 0 ? (
              <div className="text-center py-6 text-[#3a1a1a]/40">
                <p className="text-sm">Belum ada data</p>
              </div>
            ) : (
              <div className="space-y-4">
                {packageStats
                .filter((p) => p.count > 0)
                .slice(0, 4)
                .map((pkg) => {
                  const pct = pkg.total > 0 ? Math.round((pkg.count / pkg.total) * 100) : 0;
                  return (
                    <div key={pkg.id}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-[#1a0505] truncate">{pkg.title}</span>
                        <span className="text-[#8B1A1A] font-bold ml-2">{pkg.count}x</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(pct, pkg.count > 0 ? 8 : 0)}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-[#C0392B] rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}