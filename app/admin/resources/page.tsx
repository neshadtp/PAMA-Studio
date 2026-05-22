"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2, Plus, RefreshCw, Trash2, Edit3, X, Check, Camera,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ModalPortal from "@/components/ui/ModalPortal";

function CreateResourceModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ code: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Gagal buat resource."); return; }
      onSuccess();
      onClose();
      setForm({ code: "", name: "" });
    } catch { setError("Terjadi kesalahan."); }
    finally { setLoading(false); }
  };

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="bg-[#8B1A1A] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl"><Camera size={20} /></div>
            <div><h2 className="font-bold" style={{ fontFamily: "Fraunces, serif" }}>Tambah Resource</h2><p className="text-xs text-white/70">Studio atau Fotografer</p></div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-1.5">Kode</label>
            <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required placeholder="studio-1, fotografer-1" className="w-full rounded-xl border border-[#8B1A1A]/20 bg-[#FBF7F1] p-3 text-sm outline-none focus:border-[#8B1A1A]" />
            <p className="text-[10px] text-[#3a1a1a]/40 mt-1">Kode unik untuk identifikasi resource</p>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-1.5">Nama</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Self Photo Studio 1" className="w-full rounded-xl border border-[#8B1A1A]/20 bg-[#FBF7F1] p-3 text-sm outline-none focus:border-[#8B1A1A]" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-[#8B1A1A] text-white font-bold text-sm hover:bg-[#6B1212] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Tambah
          </button>
        </form>
      </motion.div>
    </div>
    </ModalPortal>
  );
}

function EditResourceModal({ resource, isOpen, onClose, onSuccess }: { resource: any; isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ code: "", name: "", is_active: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (resource) setForm({ code: resource.code || "", name: resource.name || "", is_active: resource.is_active ?? true });
  }, [resource]);

  if (!isOpen || !resource) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/resources/${resource.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Gagal update."); return; }
      onSuccess();
      onClose();
    } catch { setError("Terjadi kesalahan."); }
    finally { setLoading(false); }
  };

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="bg-[#8B1A1A] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl"><Edit3 size={20} /></div>
            <div><h2 className="font-bold" style={{ fontFamily: "Fraunces, serif" }}>Edit Resource</h2><p className="text-xs text-white/70">{resource.name}</p></div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-1.5">Kode</label>
            <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required className="w-full rounded-xl border border-[#8B1A1A]/20 bg-[#FBF7F1] p-3 text-sm outline-none focus:border-[#8B1A1A]" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-1.5">Nama</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full rounded-xl border border-[#8B1A1A]/20 bg-[#FBF7F1] p-3 text-sm outline-none focus:border-[#8B1A1A]" />
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })} className={`relative w-12 h-7 rounded-full transition-all ${form.is_active ? "bg-green-500" : "bg-gray-200"}`}>
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${form.is_active ? "right-1" : "left-1"}`} />
            </button>
            <span className="text-sm font-semibold text-[#1a0505]">{form.is_active ? "Aktif" : "Nonaktif"}</span>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-[#8B1A1A] text-white font-bold text-sm hover:bg-[#6B1212] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />} Simpan
          </button>
        </form>
      </motion.div>
    </div>
    </ModalPortal>
  );
}

export default function ResourcesPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editResource, setEditResource] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/resources");
      if (!res.ok) return;
      const data = await res.json();
      setResources(data.resources || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok || res.status === 401) { router.push("/"); return; }
        const data = await res.json();
        if (data.profile?.role !== "admin") { router.push("/"); return; }
        setIsAdmin(true);
        fetchResources();
      } catch { router.push("/"); }
    };
    checkAdmin();
  }, [router]);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/resources/${id}`, { method: "DELETE" });
    if (res.ok) {
      setResources(prev => prev.filter(r => r.id !== id));
    } else {
      const data = await res.json();
      alert(data.message || "Gagal hapus.");
    }
    setDeleteConfirm(null);
  };

  const handleEditSuccess = () => { fetchResources(); setEditResource(null); };
  const handleCreateSuccess = () => { fetchResources(); setCreateOpen(false); };

  if (!isAdmin) return (
    <div className="min-h-screen bg-[#FBF7F1] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#8B1A1A]" />
    </div>
  );

  return (
    <div className="space-y-8">
      {createOpen && <CreateResourceModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSuccess={handleCreateSuccess} />}
      {editResource && <EditResourceModal resource={editResource} isOpen={!!editResource} onClose={() => setEditResource(null)} onSuccess={handleEditSuccess} />}
      {deleteConfirm && (
        <ModalPortal>
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <motion.div initial={{ scale: 0.95 }} className="w-full max-w-sm overflow-hidden rounded-[32px] bg-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center"><Trash2 size={24} className="text-red-600" /></div>
              <div>
                <h2 className="font-bold text-[#1a0505]">Hapus Resource?</h2>
                <p className="text-xs text-[#3a1a1a]/50">{deleteConfirm.name}</p>
              </div>
            </div>
            <p className="text-sm text-[#3a1a1a]/60">Resource akan dihapus permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl border border-[#8B1A1A]/20 text-[#8B1A1A] font-bold text-sm">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700">Hapus</button>
            </div>
          </motion.div>
        </div>
        </ModalPortal>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B1A1A]">Manajemen Resource</span>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1a0505] mt-1" style={{ fontFamily: "Fraunces, serif" }}>Resources</h1>
          <p className="text-sm text-[#3a1a1a]/50 mt-1">{resources.length} resource</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchResources} className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#8B1A1A]/20 bg-white text-sm font-semibold text-[#8B1A1A] hover:bg-[#8B1A1A]/5 transition-all">
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8B1A1A] text-white text-sm font-semibold hover:bg-[#6B1212] transition-all">
            <Plus size={16} /> Tambah Resource
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#8B1A1A]" size={32} /></div>
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-[#8B1A1A]/20 p-16 text-center">
          <Camera size={40} className="text-[#8B1A1A]/20 mx-auto mb-4" />
          <p className="text-[#3a1a1a]/50 font-medium">Belum ada resource. Tambahkan studio atau fotografer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(r => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-[#8B1A1A]/10 p-6 shadow-sm hover:shadow-md hover:border-[#8B1A1A]/20 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#8B1A1A]/10 flex items-center justify-center">
                  <Camera size={24} className="text-[#8B1A1A]" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditResource(r)} className="p-2 rounded-xl border border-[#8B1A1A]/20 text-[#8B1A1A] hover:bg-[#8B1A1A]/5 transition-all"><Edit3 size={16} /></button>
                  <button onClick={() => setDeleteConfirm(r)} className="p-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-all"><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#1a0505] mb-1" style={{ fontFamily: "Fraunces, serif" }}>{r.name}</h3>
              <p className="text-xs text-[#3a1a1a]/40 font-mono mb-3">{r.code}</p>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${r.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-xs font-semibold text-[#3a1a1a]/50">{r.is_active ? "Aktif" : "Nonaktif"}</span>
                {r.packages && r.packages.length > 0 && (
                  <span className="ml-auto text-xs font-bold text-[#8B1A1A] bg-[#8B1A1A]/5 px-2 py-1 rounded-full">
                    {r.packages.length} paket
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}