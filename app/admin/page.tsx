"use client";

import React, { useEffect, useState } from "react";
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

function MiniCalendar() {
  const [current, setCurrent] = useState(new Date());
  const today = new Date();
  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  return (
    <div className="bg-white rounded-3xl border border-[#8B1A1A]/10 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrent(new Date(year, month - 1))} className="p-1.5 hover:bg-[#8B1A1A]/5 rounded-full transition-colors">
          <ChevronLeft size={16} className="text-[#3a1a1a]/60" />
        </button>
        <span className="font-bold text-[#1a0505]">{BULAN[month]} {year}</span>
        <button onClick={() => setCurrent(new Date(year, month + 1))} className="p-1.5 hover:bg-[#8B1A1A]/5 rounded-full transition-colors">
          <ChevronRight size={16} className="text-[#3a1a1a]/60" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {HARI.map(h => <div key={h} className="text-[10px] font-bold text-[#3a1a1a]/40 py-1">{h}</div>)}
        {cells.map((d, i) => (
          <div key={i} className={`text-xs py-1.5 rounded-full cursor-default transition-colors
            ${d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              ? "bg-[#8B1A1A] text-white font-bold" : d ? "text-[#3a1a1a]/70 hover:bg-[#8B1A1A]/5" : ""}`}>
            {d ?? ""}
          </div>
        ))}
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

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("Admin");
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, pendingOrders: 0, doneOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
                      {(order.profiles as any)?.full_name ?? "Customer"} — {(order.packages as any)?.title ?? "-"}
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
                {packageStats.map((pkg) => {
                  const pct = pkg.total > 0 ? Math.round((pkg.count / pkg.total) * 100) : 0;
                  return (
                    <div key={pkg.id}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-[#1a0505] truncate">{pkg.title}</span>
                        <span className="text-[#8B1A1A] font-bold ml-2">{pkg.count}x</span>
                      </div>
                      <div className="h-2.5 bg-[#8B1A1A]/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-[#8B1A1A] to-[#6B1212] rounded-full"
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