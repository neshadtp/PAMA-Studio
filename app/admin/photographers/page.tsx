"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Loader2, Plus, RefreshCw, Trash2, X, Calendar, Clock, User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ModalPortal from "@/components/ui/ModalPortal";

function timeSlotLabel(start: string, end: string) {
  const fmt = (iso: string) => new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `${fmt(start)} - ${fmt(end)}`;
}

export default function PhotographersPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [slots, setSlots] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ resource_id: "", date: "", start_time: "", end_time: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedResource) params.set("resourceId", selectedResource);
      if (selectedDate) params.set("date", selectedDate);
      const res = await fetch(`/api/admin/photographer-slots?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setSlots(data.slots || []);
      if (data.resources) setResources(data.resources);
    } finally {
      setLoading(false);
    }
  }, [selectedResource, selectedDate]);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok || res.status === 401) { router.push("/"); return; }
        const data = await res.json();
        if (data.profile?.role !== "admin") { router.push("/"); return; }
        setIsAdmin(true);
        fetchSlots();
      } catch { router.push("/"); }
    };
    checkAdmin();
  }, [router, fetchSlots]);

  useEffect(() => {
    if (isAdmin) fetchSlots();
  }, [selectedResource, selectedDate, isAdmin, fetchSlots]);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      const start_at = `${form.date}T${form.start_time}:00+07:00`;
      const end_at = `${form.date}T${form.end_time}:00+07:00`;
      const res = await fetch("/api/admin/photographer-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resource_id: form.resource_id, start_at, end_at }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.message || "Gagal buat slot."); return; }
      setSlots(prev => [...prev, data.slot].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()));
      setCreateOpen(false);
      setForm({ resource_id: "", date: "", start_time: "", end_time: "" });
    } catch { setFormError("Terjadi kesalahan."); }
    finally { setFormLoading(false); }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Hapus slot ini?")) return;
    const res = await fetch(`/api/admin/photographer-slots/${slotId}`, { method: "DELETE" });
    if (res.ok) {
      setSlots(prev => prev.filter(s => s.id !== slotId));
    } else {
      const data = await res.json();
      alert(data.message || "Gagal hapus.");
    }
  };

  if (!isAdmin) return (
    <div className="min-h-screen bg-[#FBF7F1] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#8B1A1A]" />
    </div>
  );

  const modal = createOpen ? (
    <div className="fixed inset-0 z-[100] flex h-[100dvh] w-[100vw] items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="bg-[#8B1A1A] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl"><Clock size={20} /></div>
            <div><h2 className="font-bold" style={{ fontFamily: "Fraunces, serif" }}>Tambah Slot Jadwal</h2><p className="text-xs text-white/70">Atur waktu tersedia fotografer</p></div>
          </div>
          <button onClick={() => setCreateOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
        </div>
        <form onSubmit={handleCreateSlot} className="p-6 space-y-4">
          {formError && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">{formError}</div>}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-1.5">Resource / Fotografer</label>
            <select value={form.resource_id} onChange={e => setForm({ ...form, resource_id: e.target.value })} required className="w-full rounded-xl border border-[#8B1A1A]/20 bg-[#FBF7F1] p-3 text-sm outline-none focus:border-[#8B1A1A]">
              <option value="">Pilih resource</option>
              {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-1.5">Tanggal</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required min={new Date().toISOString().split("T")[0]} className="w-full rounded-xl border border-[#8B1A1A]/20 bg-[#FBF7F1] p-3 text-sm outline-none focus:border-[#8B1A1A]" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-1.5">Mulai</label>
              <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} required className="w-full rounded-xl border border-[#8B1A1A]/20 bg-[#FBF7F1] p-3 text-sm outline-none focus:border-[#8B1A1A]" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-1.5">Selesai</label>
              <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} required className="w-full rounded-xl border border-[#8B1A1A]/20 bg-[#FBF7F1] p-3 text-sm outline-none focus:border-[#8B1A1A]" />
            </div>
          </div>
          <button type="submit" disabled={formLoading} className="w-full py-3.5 rounded-xl bg-[#8B1A1A] text-white font-bold text-sm hover:bg-[#6B1212] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {formLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Tambah Slot
          </button>
        </form>
      </motion.div>
    </div>
  ) : null;

  return (
    <>
      {modal && <ModalPortal>{modal}</ModalPortal>}
      <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B1A1A]">Manajemen Jadwal</span>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1a0505] mt-1" style={{ fontFamily: "Fraunces, serif" }}>Photographer Slots</h1>
          <p className="text-sm text-[#3a1a1a]/50 mt-1">{slots.length} slot jadwal</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchSlots} className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#8B1A1A]/20 bg-white text-sm font-semibold text-[#8B1A1A] hover:bg-[#8B1A1A]/5 transition-all">
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8B1A1A] text-white text-sm font-semibold hover:bg-[#6B1212] transition-all">
            <Plus size={16} /> Tambah Slot
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 rounded-2xl border border-[#8B1A1A]/10 bg-white px-4">
          <User size={16} className="text-[#8B1A1A]/30" />
          <select value={selectedResource} onChange={e => setSelectedResource(e.target.value)} className="py-3 text-sm text-[#1a0505] outline-none bg-transparent flex-1">
            <option value="">Semua Resource</option>
            {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-[#8B1A1A]/10 bg-white px-4">
          <Calendar size={16} className="text-[#8B1A1A]/30" />
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="py-3 text-sm outline-none bg-transparent flex-1" />
          {selectedDate && (
            <button onClick={() => setSelectedDate("")} className="p-1 hover:bg-[#8B1A1A]/5 rounded-full"><X size={14} /></button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#8B1A1A]" size={32} /></div>
      ) : slots.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-[#8B1A1A]/20 p-16 text-center">
          <Clock size={40} className="text-[#8B1A1A]/20 mx-auto mb-4" />
          <p className="text-[#3a1a1a]/50 font-medium">Belum ada slot jadwal.</p>
          <p className="text-xs text-[#3a1a1a]/30 mt-1">Tambahkan slot untuk mengatur jadwal fotografer.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#8B1A1A]/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FBF7F1] text-[#3a1a1a]/50 text-xs uppercase tracking-wide">
                  <th className="px-6 py-3 text-left font-bold">Resource</th>
                  <th className="px-6 py-3 text-left font-bold">Tanggal</th>
                  <th className="px-6 py-3 text-left font-bold">Waktu</th>
                  <th className="px-6 py-3 text-left font-bold">Status</th>
                  <th className="px-6 py-3 text-right font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#8B1A1A]/5">
                {slots.map(slot => (
                  <tr key={slot.id} className="hover:bg-[#FBF7F1]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#8B1A1A]/10 flex items-center justify-center">
                          <User size={16} className="text-[#8B1A1A]" />
                        </div>
                        <span className="font-semibold text-[#1a0505]">{slot.resources?.name || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#3a1a1a]/70">
                      {slot.start_at ? new Date(slot.start_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                    </td>
                    <td className="px-6 py-4 font-medium text-[#1a0505]">
                      {timeSlotLabel(slot.start_at, slot.end_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${slot.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${slot.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                        {slot.is_active ? "Tersedia" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteSlot(slot.id)} className="p-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </>
  );
}