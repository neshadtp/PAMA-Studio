"use client";

import React, { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browse";
import React, { useEffect, useMemo, useState } from "react";
import {
  Users, ShoppingBag, Clock, CheckCircle, TrendingUp,
  ArrowUpRight, Loader2, AlertCircle, ChevronLeft, ChevronRight,
} from "lucide-react";

function formatIDR(n: number) {
  return "Rp " + new Intl.NumberFormat("id-ID").format(n);
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  awaiting_payment: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  scheduled: "bg-purple-100 text-purple-700",
  in_progress: "bg-cyan-100 text-cyan-700",
  done: "bg-gray-100 text-gray-600",
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
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const year = wib.getUTCFullYear();
  const month = String(wib.getUTCMonth() + 1).padStart(2, "0");
  const day = String(wib.getUTCDate()).padStart(2, "0");
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrent(new Date(year, month - 1))} className="p-1 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={16} />
        </button>
        <span className="font-bold text-gray-800">{BULAN[month]} {year}</span>
        <button onClick={() => setCurrent(new Date(year, month + 1))} className="p-1 hover:bg-gray-100 rounded-full">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {HARI.map(h => <div key={h} className="text-[10px] font-bold text-gray-400 py-1">{h}</div>)}
        {cells.map((d, i) => (
          <div key={i} className={`text-xs py-1.5 rounded-full cursor-default
            ${d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              ? "bg-red-600 text-white font-bold" : d ? "text-gray-700 hover:bg-gray-100" : ""}`}>
            {d ?? ""}
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
                  <span>{new Date(order.scheduled_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })}</span>
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

export default function AdminPage() {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("Admin");
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, pendingOrders: 0, doneOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [packageStats, setPackageStats] = useState<{ title: string; count: number; total: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
        if (profile?.full_name) setAdminName(profile.full_name);
      }

      const { count: userCount } = await supabase.from("profiles").select("id", { count: "exact", head: true });
      const { data: allOrders } = await supabase.from("orders").select("id, status, total_price_idr, package_id");
      const totalOrders = allOrders?.length ?? 0;
      const pendingOrders = allOrders?.filter(o => ["pending","awaiting_payment"].includes(o.status)).length ?? 0;
      const doneOrders = allOrders?.filter(o => o.status === "done").length ?? 0;
      setStats({ totalUsers: userCount ?? 0, totalOrders, pendingOrders, doneOrders });

      // Recent orders
      const { data: recent } = await supabase
        .from("orders")
        .select("id, status, total_price_idr, created_at, scheduled_at, packages(title), profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentOrders((recent as any[]) ?? []);

      // Package stats
      const { data: pkgs } = await supabase.from("packages").select("id, title");
      if (pkgs && allOrders) {
        const stats = pkgs.map(pkg => ({
          title: pkg.title,
          count: allOrders.filter(o => o.package_id === pkg.id).length,
          total: totalOrders,
        })).filter(p => p.count > 0).sort((a, b) => b.count - a.count).slice(0, 4);
        setPackageStats(stats);
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const todayStr = new Date().toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-red-600" size={32} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-red-600 text-sm font-semibold">Dashboard</p>
          <h1 className="text-2xl font-bold text-gray-800">Selamat datang, {adminName}!</h1>
        </div>
        <span className="text-sm text-gray-500">{todayStr}</span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "User Aktif", value: stats.totalUsers, icon: <Users size={20} />, color: "text-red-500 bg-red-50" },
          { label: "Total Booking", value: stats.totalOrders, icon: <ShoppingBag size={20} />, color: "text-red-500 bg-red-50" },
          { label: "Pesanan Diproses", value: stats.pendingOrders, icon: <Clock size={20} />, color: "text-red-500 bg-red-50" },
          { label: "Sesi Selesai", value: stats.doneOrders, icon: <CheckCircle size={20} />, color: "text-red-500 bg-red-50" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              {card.icon}
            </div>
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
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

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Aktivitas Terbaru</h2>
            <a href="/admin/operational" className="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1">
              Lihat Semua <ArrowUpRight size={12} />
            </a>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <AlertCircle size={28} className="mb-2" />
              <p className="text-sm">Belum ada aktivitas</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag size={16} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {(order.profiles as any)?.full_name ?? "Customer"} — {(order.packages as any)?.title ?? "-"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLE[order.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                    <span className="text-xs font-semibold text-gray-700">{formatIDR(order.total_price_idr)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Calendar */}
          <MiniCalendar />

          {/* Paket Populer */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4">Paket Populer</h2>
            {packageStats.length === 0 ? (
              <p className="text-sm text-gray-400">Belum ada data</p>
            ) : (
              <div className="space-y-3">
                {packageStats.map((pkg) => {
                  const pct = pkg.total > 0 ? Math.round((pkg.count / pkg.total) * 100) : 0;
                  return (
                    <div key={pkg.title}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700 truncate">{pkg.title}</span>
                        <span className="text-gray-400 ml-2">{pkg.count}x</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
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