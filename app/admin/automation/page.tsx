"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabase-browser";
import { Loader2, Sparkles, Bell, RefreshCw, TrendingUp, Zap, PieChart, ChevronRight, DollarSign, ShoppingBag, CheckCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AutoLog = {
  time: string;
  activity: string;
  cause: string;
  status: "Gagal" | "Berhasil";
};

type Range = "daily" | "weekly" | "monthly";

interface AIInsight {
  executive_summary: string;
  performance_analysis: string;
  package_insights: string;
  recommendations: string[];
}

interface StatsData {
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  popularPackages: { title: string; count: number }[];
  dateRange: { start: string; end: string };
}

export default function AutomationPage() {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState("");
  const [logs, setLogs] = useState<AutoLog[]>([]);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });

  // AI Insight states
  const [range, setRange] = useState<Range>("daily");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ stats: StatsData; insight: AIInsight } | null>(null);
  const [usage, setUsage] = useState<Record<Range, number>>({ daily: 0, weekly: 0, monthly: 0 });

  useEffect(() => {
    const stored = localStorage.getItem("pama_ai_usage");
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem("pama_ai_usage_date");

    if (lastDate !== today) {
      localStorage.setItem("pama_ai_usage_date", today);
      localStorage.setItem("pama_ai_usage", JSON.stringify({ daily: 0, weekly: 0, monthly: 0 }));
    } else if (stored) {
      setUsage(JSON.parse(stored));
    }
  }, []);

  const generateInsight = async () => {
    if (usage[range] >= 3) {
      alert(`Batas harian tercapai! Anda hanya dapat generate insight ${range} maksimal 3 kali sehari.`);
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch("/api/admin/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ range }),
      });
      const data = await response.json();
      if (data.success) {
        setAiResult({ stats: data.data, insight: data.insight });
        
        const newUsage = { ...usage, [range]: usage[range] + 1 };
        setUsage(newUsage);
        localStorage.setItem("pama_ai_usage", JSON.stringify(newUsage));
      } else {
        alert(data.error || "Gagal mengambil insight");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setAiLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);

    const today = new Date().toISOString().slice(0, 10);

    const { data: todayOrders } = await supabase
      .from("orders")
      .select("id, status, created_at, packages(title), profiles(full_name)")
      .gte("created_at", `${today}T00:00:00`)
      .order("created_at", { ascending: true });

    const total = todayOrders?.length ?? 0;
    const success =
    todayOrders?.filter((o: any) =>
        ["paid", "scheduled", "done"].includes(String(o.status))
    ).length ?? 0;

    const failed =
    todayOrders?.filter((o: any) =>
        String(o.status) === "cancelled"
    ).length ?? 0;

    setStats({ total, success, failed });

    setSummary(
      total > 0
        ? `Hari ini sistem menjalankan ${total} otomatisasi.\n${success} berhasil dan ${failed} gagal.\nAktivitas terbanyak: Notifikasi Jadwal Booking.\n${failed > 0 ? "Kegagalan terbanyak terjadi karena jadwal studio penuh." : "Semua aktivitas berjalan lancar."}`
        : "Belum ada aktivitas otomatisasi hari ini."
    );

    const logList: AutoLog[] = [];

    for (const o of todayOrders?.filter((o: any) => String(o.status) === "cancelled") ?? []) {
      logList.push({
        time: new Date(o.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        activity: `Booking ${(o.packages as any)?.title ?? "-"}`,
        cause: "Pesanan dibatalkan",
        status: "Gagal",
      });
    }

    const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString();
    const { data: longPending } = await supabase
      .from("orders")
      .select("id, created_at, packages(title)")
      .eq("status", "pending")
      .lt("created_at", twoHoursAgo)
      .order("created_at", { ascending: true })
      .limit(10);

    for (const o of longPending ?? []) {
      logList.push({
        time: new Date(o.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        activity: "Sinkronisasi Jadwal",
        cause: `Pending lama: ${(o.packages as any)?.title ?? "-"}`,
        status: "Gagal",
      });
    }

    for (const o of todayOrders?.filter((o: any) => String(o.status) === "scheduled").slice(0, 3) ?? []) {
      logList.push({
        time: new Date(o.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        activity: `Konfirmasi ${(o.packages as any)?.title ?? "-"}`,
        cause: "Terjadwal otomatis",
        status: "Berhasil",
      });
    }

    setLogs(logList.sort((a, b) => a.time.localeCompare(b.time)));
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-red-600" size={32} />
    </div>
  );

  const failedLogs = logs.filter(l => l.status === "Gagal");

  return (
    <div className="space-y-6">
      {/* AI Insight Section - New Integration */}
      <div className="w-full space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[#8B1A1A] p-8 rounded-[2rem] text-white shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest">Powered by Llama 3.1</span>
            </div>
            <h2 className="text-3xl font-black">
              Business <span className="text-white/80">Intelligence</span>
            </h2>
            <p className="text-white/60 text-sm mt-1 max-w-md">
              Analisis data studio Anda secara instan untuk mendapatkan strategi pertumbuhan yang tepat.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-1 bg-white/10 p-1.5 rounded-2xl border border-white/20">
              {(["daily", "weekly", "monthly"] as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    range === r
                      ? "bg-white text-[#8B1A1A] shadow-sm"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {r === "daily" ? "Harian" : r === "weekly" ? "Mingguan" : "Bulanan"}
                  {usage[r] > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-white/40 text-white text-[10px] flex items-center justify-center rounded-full">
                      {usage[r]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={generateInsight}
                disabled={aiLoading || usage[range] >= 3}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 bg-white hover:bg-white/90 text-[#8B1A1A] rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                {aiLoading ? "Analyst is thinking..." : usage[range] >= 3 ? "Batas Tercapai" : "Generate Insights"}
              </button>
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-tighter">
                Sisa hari ini: {3 - usage[range]}x generate
              </span>
            </div>
          </div>
        </div>

        {/* AI Insight Result */}
        <AnimatePresence mode="wait">
          {aiResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#8B1A1A] p-6 rounded-[2rem] text-white shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-white/20">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-black tracking-tight">
                      Rp {aiResult.stats.totalRevenue.toLocaleString("id-ID")}
                    </div>
                    <p className="text-[10px] font-medium text-white/60 flex items-center gap-1">
                      <ChevronRight className="w-3 h-3" />
                      Total Revenue
                    </p>
                  </div>
                </div>
                <div className="bg-[#8B1A1A] p-6 rounded-[2rem] text-white shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-white/20">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-black tracking-tight">{aiResult.stats.totalOrders}</div>
                    <p className="text-[10px] font-medium text-white/60 flex items-center gap-1">
                      <ChevronRight className="w-3 h-3" />
                      Total Orders
                    </p>
                  </div>
                </div>
                <div className="bg-[#8B1A1A] p-6 rounded-[2rem] text-white shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-white/20">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-black tracking-tight">{aiResult.stats.completedOrders}</div>
                    <p className="text-[10px] font-medium text-white/60 flex items-center gap-1">
                      <ChevronRight className="w-3 h-3" />
                      Completed
                    </p>
                  </div>
                </div>
                <div className="bg-[#8B1A1A] p-6 rounded-[2rem] text-white shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-white/20">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-black tracking-tight">{aiResult.stats.pendingOrders}</div>
                    <p className="text-[10px] font-medium text-white/60 flex items-center gap-1">
                      <ChevronRight className="w-3 h-3" />
                      Active
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Insight Content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Analysis Column */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                          <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Executive Summary</h3>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                        {aiResult.insight.executive_summary.split(/(\*\*.*?\*\*)/).map((part, index) => 
                          part.startsWith("**") && part.endsWith("**") 
                            ? <strong key={index} className="text-zinc-900 dark:text-zinc-100 font-black">{part.slice(2, -2)}</strong>
                            : part
                        )}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                          <TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Performance</h3>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                        {aiResult.insight.performance_analysis.split(/(\*\*.*?\*\*)/).map((part, index) => 
                          part.startsWith("**") && part.endsWith("**") 
                            ? <strong key={index} className="text-zinc-900 dark:text-zinc-100 font-black">{part.slice(2, -2)}</strong>
                            : part
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                        <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Strategic Recommendations</h3>
                    </div>
                    <ul className="space-y-4">
                      {aiResult.insight.recommendations.map((item, i) => (
                        <li key={i} className="flex items-start gap-4 text-zinc-700 dark:text-zinc-300">
                          <div className="mt-1.5 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                            {i + 1}
                          </div>
                          <span className="text-sm leading-relaxed font-medium">
                            {item.split(/(\*\*.*?\*\*)/).map((part, index) => 
                              part.startsWith("**") && part.endsWith("**") 
                                ? <strong key={index} className="text-zinc-900 dark:text-zinc-100 font-black">{part.slice(2, -2)}</strong>
                                : part
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Sidebar: Package & Insight */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2.5 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                        <PieChart className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <h3 className="text-xl font-bold">Package Stats</h3>
                    </div>

                    <div className="space-y-6">
                      {aiResult.stats.popularPackages.map((pkg, i) => (
                        <div key={i} className="group">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">{pkg.title}</span>
                            <span className="text-xs font-black text-zinc-400">{pkg.count} orders</span>
                          </div>
                          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(pkg.count / Math.max(...aiResult.stats.popularPackages.map(p => p.count), 1)) * 100}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-[#8B1A1A] to-[#8B1A1A]/70 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                      
                      <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">AI Contextual Insight</h4>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                          "{aiResult.insight.package_insights}"
                        </p>
                      </div>

                      {aiResult.stats.popularPackages.length === 0 && (
                        <p className="text-sm text-zinc-500 italic text-center py-4">Belum ada data paket.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 bg-zinc-50 dark:bg-zinc-900/20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem]"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-[#8B1A1A]/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative p-6 bg-white dark:bg-zinc-800 rounded-3xl shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-700">
                  <Sparkles className="w-10 h-10 text-[#8B1A1A]" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Ready to analyze?</h3>
              <p className="text-zinc-500 text-center max-w-xs mt-3 font-medium">
                Dapatkan analisis mendalam dan strategi bisnis berdasarkan performa studio Anda.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Automation Summary & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summary */}
        <div className="bg-[#8B1A1A] rounded-2xl p-6 text-white">
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/70">Summary AI Insights</p>
            <p className="text-sm text-white/80">Ringkasan Otomatisasi</p>
          </div>
          <div className="bg-white/20 rounded-xl p-4">
            <p className="text-sm leading-relaxed whitespace-pre-line">{summary}</p>
          </div>
        </div>

        {/* Automation Stats */}
        <div className="bg-[#8B1A1A] rounded-2xl p-6 text-white">
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/70">Automation Stats</p>
            <p className="text-sm text-white/80">Statistik Hari Ini</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-black">{stats.total}</div>
              <div className="text-xs text-white/60">Total</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-green-300">{stats.success}</div>
              <div className="text-xs text-white/60">Berhasil</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-red-300">{stats.failed}</div>
              <div className="text-xs text-white/60">Gagal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[#8B1A1A] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bell size={18} />
            <p className="font-black uppercase tracking-widest text-sm">Notifications</p>
          </div>
          <button onClick={fetchData} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition">
            <RefreshCw size={14} />
          </button>
        </div>
        <p className="text-sm text-white/70 mb-4">
          Terdapat {failedLogs.length} Aktivitas Automation yang Memerlukan Pengecekan.
        </p>

        {logs.length === 0 ? (
          <div className="bg-white/10 rounded-xl p-6 text-center text-white/50 text-sm">
            Tidak ada aktivitas hari ini
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                {/* Header */}
                <div className="mb-2 grid grid-cols-4 gap-4 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white/60">
                  <span>Waktu</span>
                  <span>Aktivitas Automation</span>
                  <span>Penyebab</span>
                  <span>Status</span>
                </div>

                {/* Scrollable rows */}
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {logs.map((log, i) => (
                    <div key={i} className="grid grid-cols-4 gap-4 items-center rounded-xl bg-white/10 px-4 py-4 transition hover:bg-white/20">
                      <span className="text-sm font-bold">{log.time}</span>
                      <span className="text-sm">{log.activity}</span>
                      <span className="text-sm text-white/80">{log.cause}</span>
                      <span>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          log.status === "Gagal"
                            ? "bg-red-500/40 text-red-200"
                            : "bg-green-500/30 text-green-200"
                        }`}>
                          {log.status}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}