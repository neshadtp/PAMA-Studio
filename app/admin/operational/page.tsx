"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  RefreshCw, Download, Clock, ChevronDown, Check, Loader2,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

function getAutoStatus(order: any) {
  if (order.status === "cancelled") return "cancelled";
  if (!order.scheduled_at) return order.status;
  const now = new Date();
  const scheduled = new Date(order.scheduled_at);
  return now > scheduled ? "done" : "scheduled";
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff} detik lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  scheduled: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-600",
  paid: "bg-green-100 text-green-700",
  done: "bg-green-50 text-green-600",
  in_progress: "bg-cyan-100 text-cyan-700",
  awaiting_payment: "bg-orange-100 text-orange-700",
};

const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-400",
  scheduled: "bg-blue-500",
  cancelled: "bg-red-500",
  paid: "bg-green-500",
  done: "bg-green-400",
  in_progress: "bg-cyan-500",
  awaiting_payment: "bg-orange-400",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  awaiting_payment: "Menunggu Bayar",
  paid: "Dibayar",
  scheduled: "Terkonfirmasi",
  in_progress: "Berlangsung",
  done: "Selesai",
  cancelled: "Dibatalkan",
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "scheduled", label: "Konfirmasi" },
  { value: "cancelled", label: "Batalkan" },
];

function StatusDropdown({ orderId, current, onUpdate }: {
  orderId: string;
  current: string;
  onUpdate: (id: string, status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen(v => !v);
  };

  const handleSelect = async (status: string) => {
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/operational", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) {
        onUpdate(orderId, status);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${STATUS_COLOR[current] ?? "bg-gray-100 text-gray-500"}`}
      >
        <span className={`w-2 h-2 rounded-full ${STATUS_DOT[current] ?? "bg-gray-400"}`} />
        {loading ? <Loader2 size={12} className="animate-spin" /> : STATUS_LABEL[current] ?? current}
        <ChevronDown size={12} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed w-44 bg-white rounded-2xl shadow-xl border border-[#8B1A1A]/10 z-50 overflow-hidden"
            style={{ top: pos.top, left: pos.left }}
          >
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-[#FBF7F1] transition
                  ${current === opt.value ? "text-[#8B1A1A]" : "text-[#3a1a1a]"}`}
              >
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[opt.value] ?? "bg-gray-400"}`} />
                {opt.label}
                {current === opt.value && <Check size={14} className="ml-auto text-[#8B1A1A]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function OperationalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [todayOrders, setTodayOrders] = useState<any[]>([]);
  const [weekStats, setWeekStats] = useState({ thisWeek: 0, lastWeek: 0 });
  const [pendingCount, setPendingCount] = useState(0);
  const [longestPending, setLongestPending] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });

const fetchData = async (page = 1) => {
  setLoading(true);
  try {
    const [res, todayRes] = await Promise.all([
      fetch(`/api/admin/operational?page=${page}&limit=50`),
      fetch(`/api/admin/operational?today=true`),
    ]);

    if (!res.ok) { console.error("Failed to fetch operational data"); return; }

    const data = await res.json();
    const todayData = await todayRes.json();

    setOrders(data.orders);
    setPagination(data.pagination);
    setTodayOrders(todayData.orders);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekOrders = data.orders.filter((o: any) =>
      new Date(o.created_at) >= weekAgo
    ).length;

    const lastWeekOrders = data.orders.filter((o: any) =>
      new Date(o.created_at) >= twoWeeksAgo && new Date(o.created_at) < weekAgo
    ).length;

    setWeekStats({ thisWeek: thisWeekOrders, lastWeek: lastWeekOrders });

    const pendingOrders = data.orders.filter((o: any) => o.status === "pending");
    setPendingCount(pendingOrders.length);
    if (pendingOrders.length > 0) setLongestPending(pendingOrders[0].created_at);

  } catch (error) {
    console.error("Fetch data error:", error);
  } finally {
    setLoading(false);
  }
};

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
        fetchData();
      } catch (error) {
        console.error("Admin check error:", error);
        router.push("/");
      }
    };

    checkAdmin();
  }, [router]);

  const handleStatusUpdate = (id: string, status: string) => {
  setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  setTodayOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  if (status !== "pending") setPendingCount(prev => Math.max(0, prev - 1));
};

  const pct = weekStats.lastWeek > 0
  ? Math.round(((weekStats.thisWeek - weekStats.lastWeek) / weekStats.lastWeek) * 100)
  : weekStats.thisWeek > 0 ? 100 : 0;

  const todayStr = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const todayBooking = todayOrders.length;
  const inProgressCount = todayOrders.filter((o: any) => getAutoStatus(o) === "done").length;

  const exportCSV = () => {
    const rows = [["ID", "Customer", "Paket", "Status", "Jadwal", "Total"]];
    orders.forEach(o => {
      rows.push([
        o.id.slice(0, 8),
        o.profiles?.full_name ?? "-",
        o.packages?.title ?? "-",
        STATUS_LABEL[o.status] ?? o.status,
        o.scheduled_at ? new Date(o.scheduled_at).toLocaleString("id-ID") : "-",
        new Intl.NumberFormat("id-ID").format(o.total_price_idr),
      ]);
    });
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "orders.csv";
    a.click();
  };

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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-[#8B1A1A]" size={32} />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B1A1A]">Sistem Operasional</span>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1a0505] mt-1" style={{ fontFamily: "Fraunces, serif" }}>
            Operational Health
          </h1>
          <p className="text-sm text-[#3a1a1a]/50 mt-1">{todayStr}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchData(currentPage)} className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#8B1A1A]/20 bg-white text-sm font-semibold text-[#8B1A1A] hover:bg-[#8B1A1A]/5 transition-all">
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#8B1A1A] text-white text-sm font-semibold hover:bg-[#6B1212] transition-all">
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-[#8B1A1A]/10 p-6 shadow-sm"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#3a1a1a]/40 mb-3">Total Booking Minggu Ini</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-black text-[#1a0505]">{pct >= 0 ? "+" : ""}{pct}%</span>
            <span className="text-xs text-[#3a1a1a]/50">dari Minggu Lalu</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#3a1a1a]/60">
              <span>Minggu Lalu</span>
              <span className="font-semibold text-[#8B1A1A]">{weekStats.lastWeek} booking</span>
            </div>
            <div className="h-2 bg-[#8B1A1A]/5 rounded-full overflow-hidden">
              <div className="h-full bg-[#8B1A1A]/40 rounded-full" style={{ width: `${Math.min((weekStats.lastWeek / Math.max(weekStats.thisWeek, weekStats.lastWeek, 1)) * 100, 100)}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs text-[#3a1a1a]/60">
              <span>Minggu Ini</span>
              <span className="font-semibold text-[#8B1A1A]">{weekStats.thisWeek} booking</span>
            </div>
            <div className="h-2 bg-[#8B1A1A]/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((weekStats.thisWeek / Math.max(weekStats.thisWeek, weekStats.lastWeek, 1)) * 100, 100)}%` }}
                className="h-full bg-[#8B1A1A] rounded-full"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-[#8B1A1A]/10 p-6 shadow-sm flex flex-col"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#3a1a1a]/40 mb-4">Booking Hari Ini</p>
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Calendar size={22} className="text-blue-500" />
            </div>
            <div>
              <p className="text-3xl font-black text-[#1a0505]">{todayBooking} <span className="text-base font-medium text-[#3a1a1a]/50">Booking</span></p>
              <p className="text-xs text-[#3a1a1a]/50 mt-1">{inProgressCount} booking selesai</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl border border-[#8B1A1A]/10 p-6 shadow-sm flex flex-col"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#3a1a1a]/40 mb-4">Booking Pending</p>
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Clock size={22} className="text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-3xl font-black text-[#1a0505]">{pendingCount} <span className="text-base font-medium text-[#3a1a1a]/50">Pending</span></p>
              {longestPending && <p className="text-xs text-[#3a1a1a]/40 mt-1">Terlama: {timeAgo(longestPending)}</p>}
            </div>
          </div>
          {pendingCount > 0 && (
            <button className="mt-4 self-start px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-xs font-bold hover:bg-amber-200 transition-all">
              Review Pending
            </button>
          )}
        </motion.div>
      </div>

      <div className="bg-white rounded-3xl border border-[#8B1A1A]/10 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#8B1A1A]/10">
          <h2 className="font-bold text-[#1a0505] text-lg">Jadwal Hari Ini</h2>
          <p className="text-xs text-[#3a1a1a]/50 mt-0.5">{todayStr}</p>
        </div>
        {todayOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#3a1a1a]/30">
            <Clock size={32} className="mb-3" />
            <p className="text-sm font-medium">Tidak ada jadwal hari ini</p>
            <Link href="/admin/operational" className="mt-3 text-xs text-[#8B1A1A] font-semibold hover:underline">Lihat semua pesanan</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FBF7F1] text-[#3a1a1a]/50 text-xs uppercase tracking-wide">
                  <th className="px-6 py-3 text-left font-bold">Sesi</th>
                  <th className="px-6 py-3 text-left font-bold">Paket</th>
                  <th className="px-6 py-3 text-left font-bold">Customer</th>
                  <th className="px-6 py-3 text-left font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#8B1A1A]/5">
                {todayOrders.map(order => (
                  <tr key={order.id} className="hover:bg-[#FBF7F1]/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#1a0505]">
                      {order.scheduled_at ? formatTime(order.scheduled_at) : "—"}
                    </td>
                    <td className="px-6 py-4 text-[#3a1a1a]/70">{(order.packages as any)?.title ?? "-"}</td>
                    <td className="px-6 py-4 text-[#1a0505]">{(order.profiles as any)?.full_name ?? "-"}</td>
                    <td className="px-6 py-4">
                      {(() => {
                        const auto = getAutoStatus(order);
                        return (
                          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold w-fit ${STATUS_COLOR[auto]}`}>
                            <span className={`w-2 h-2 rounded-full ${STATUS_DOT[auto]}`} />
                            {STATUS_LABEL[auto]}
                        </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-[#8B1A1A]/10 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#8B1A1A]/10">
          <div>
            <h2 className="font-bold text-[#1a0505] text-lg">Aktivitas Terbaru</h2>
            <p className="text-xs text-[#3a1a1a]/50 mt-0.5">Update booking terbaru</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#3a1a1a]/50">Total: {pagination.total} pesanan</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FBF7F1] text-[#3a1a1a]/50 text-xs uppercase tracking-wide">
                <th className="px-6 py-3 text-left font-bold">Customer</th>
                <th className="px-6 py-3 text-left font-bold">Paket</th>
                <th className="px-6 py-3 text-left font-bold">Total</th>
                <th className="px-6 py-3 text-left font-bold">Status</th>
                <th className="px-6 py-3 text-left font-bold">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8B1A1A]/5">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-[#FBF7F1]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B1A1A] to-[#6B1212] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {((order.profiles as any)?.full_name ?? "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1a0505]">{(order.profiles as any)?.full_name ?? "-"}</p>
                        <p className="text-xs text-[#3a1a1a]/40">{(order.profiles as any)?.email ?? ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#3a1a1a]/70">{(order.packages as any)?.title ?? "-"}</td>
                  <td className="px-6 py-4 font-semibold text-[#1a0505]">
                    Rp {new Intl.NumberFormat("id-ID").format(order.total_price_idr)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusDropdown orderId={order.id} current={order.status} onUpdate={handleStatusUpdate} />
                  </td>
                  <td className="px-6 py-4 text-[#3a1a1a]/50 text-xs">{timeAgo(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#8B1A1A]/10">
            <span className="text-xs text-[#3a1a1a]/50">
              Page {currentPage} dari {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); fetchData(currentPage - 1); }}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded-full border border-[#8B1A1A]/20 text-xs font-semibold disabled:opacity-50 hover:bg-[#8B1A1A]/5 transition-all"
              >
                Prev
              </button>
              <button
                onClick={() => { setCurrentPage(p => Math.min(pagination.totalPages, p + 1)); fetchData(currentPage + 1); }}
                disabled={currentPage >= pagination.totalPages}
                className="px-3 py-1.5 rounded-full border border-[#8B1A1A]/20 text-xs font-semibold disabled:opacity-50 hover:bg-[#8B1A1A]/5 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}