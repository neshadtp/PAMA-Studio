"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2, Plus, Search, RefreshCw, Trash2, KeyRound,
  ChevronDown, Check, X, Edit3, UserCog, Shield, User,
  ChevronLeft, ChevronRight, UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ModalPortal from "@/components/ui/ModalPortal";

const ROLE_COLOR: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  client: "bg-blue-100 text-blue-700",
};

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  client: "Client",
};

function CreateUserModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role: "client", phone_whatsapp: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Gagal buat user."); return; }
      onSuccess();
      onClose();
      setForm({ email: "", password: "", full_name: "", role: "client", phone_whatsapp: "" });
    } catch {
      setError("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="bg-[#8B1A1A] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl"><UserPlus size={20} /></div>
            <div><h2 className="font-bold" style={{ fontFamily: "Fraunces, serif" }}>Tambah User Baru</h2><p className="text-xs text-white/70">Buat akun client atau admin</p></div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-1.5">Nama Lengkap</label>
            <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required className="w-full rounded-xl border border-[#8B1A1A]/20 bg-[#FBF7F1] p-3 text-sm outline-none focus:border-[#8B1A1A]" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="w-full rounded-xl border border-[#8B1A1A]/20 bg-[#FBF7F1] p-3 text-sm outline-none focus:border-[#8B1A1A]" placeholder="email@example.com" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-1.5">Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} className="w-full rounded-xl border border-[#8B1A1A]/20 bg-[#FBF7F1] p-3 text-sm outline-none focus:border-[#8B1A1A]" placeholder="Min 6 karakter" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-1.5">Role</label>
            <div className="flex rounded-xl border border-[#8B1A1A]/20 overflow-hidden">
              {(["client", "admin"] as const).map(r => (
                <button key={r} type="button" onClick={() => setForm({ ...form, role: r })} className={`flex-1 py-3 text-sm font-bold transition-all ${form.role === r ? "bg-[#8B1A1A] text-white" : "bg-white text-[#3a1a1a]/50 hover:bg-[#FBF7F1]"}`}>
                  {r === "admin" ? "Admin" : "Client"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-1.5">No. WhatsApp (opsional)</label>
            <input value={form.phone_whatsapp} onChange={e => setForm({ ...form, phone_whatsapp: e.target.value })} className="w-full rounded-xl border border-[#8B1A1A]/20 bg-[#FBF7F1] p-3 text-sm outline-none focus:border-[#8B1A1A]" placeholder="08xxxxxxxxxx" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-[#8B1A1A] text-white font-bold text-sm hover:bg-[#6B1212] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Buat User
          </button>
        </form>
      </motion.div>
    </div>
    </ModalPortal>
  );
}

function EditUserModal({ user, isOpen, onClose, onSuccess }: { user: any; isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ full_name: "", role: "", phone_whatsapp: "", instagram_handle: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) setForm({ full_name: user.full_name || "", role: user.role || "client", phone_whatsapp: user.phone_whatsapp || "", instagram_handle: user.instagram_handle || "" });
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: form.full_name, role: form.role, phone_whatsapp: form.phone_whatsapp, instagram_handle: form.instagram_handle }),
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
            <div><h2 className="font-bold" style={{ fontFamily: "Fraunces, serif" }}>Edit User</h2><p className="text-xs text-white/70">#{user.id?.slice(0, 8)}</p></div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-1.5">Nama Lengkap</label>
            <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required className="w-full rounded-xl border border-[#8B1A1A]/20 bg-[#FBF7F1] p-3 text-sm outline-none focus:border-[#8B1A1A]" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-1.5">Role</label>
            <div className="flex rounded-xl border border-[#8B1A1A]/20 overflow-hidden">
              {(["client", "admin"] as const).map(r => (
                <button key={r} type="button" onClick={() => setForm({ ...form, role: r })} className={`flex-1 py-3 text-sm font-bold transition-all ${form.role === r ? "bg-[#8B1A1A] text-white" : "bg-white text-[#3a1a1a]/50 hover:bg-[#FBF7F1]"}`}>
                  {r === "admin" ? "Admin" : "Client"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-1.5">WhatsApp</label>
            <input value={form.phone_whatsapp} onChange={e => setForm({ ...form, phone_whatsapp: e.target.value })} className="w-full rounded-xl border border-[#8B1A1A]/20 bg-[#FBF7F1] p-3 text-sm outline-none focus:border-[#8B1A1A]" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-1.5">Instagram</label>
            <input value={form.instagram_handle} onChange={e => setForm({ ...form, instagram_handle: e.target.value })} className="w-full rounded-xl border border-[#8B1A1A]/20 bg-[#FBF7F1] p-3 text-sm outline-none focus:border-[#8B1A1A]" />
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

function ResetPassModal({ user, isOpen, onClose }: { user: any; isOpen: boolean; onClose: () => void }) {
  const [tempPass, setTempPass] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setTempPass(data.tempPassword);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="bg-[#8B1A1A] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl"><KeyRound size={20} /></div>
            <div><h2 className="font-bold" style={{ fontFamily: "Fraunces, serif" }}>Reset Password</h2><p className="text-xs text-white/70">{user.full_name}</p></div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          {tempPass ? (
            <div className="rounded-2xl bg-green-50 border border-green-200 p-4">
              <p className="text-xs font-bold uppercase text-green-600 mb-2">Password Sementara</p>
              <p className="text-2xl font-mono font-bold text-green-700">{tempPass}</p>
              <p className="text-xs text-green-600 mt-2">Berikan password ini ke user.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-[#3a1a1a]/60">Password user akan direset ke password sementara yang baru.</p>
              <button onClick={handleReset} disabled={loading} className="w-full py-3.5 rounded-xl bg-[#8B1A1A] text-white font-bold text-sm hover:bg-[#6B1212] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />} Generate Password Baru
              </button>
            </>
          )}
          <button onClick={onClose} className="w-full py-3 rounded-xl border border-[#8B1A1A]/20 text-[#8B1A1A] font-semibold text-sm hover:bg-[#FBF7F1] transition-all">Tutup</button>
        </div>
      </motion.div>
    </div>
    </ModalPortal>
  );
}

export default function UsersPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [resetUser, setResetUser] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  const fetchUsers = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "15" });
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || 1);
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
        fetchUsers();
      } catch { router.push("/"); }
    };
    checkAdmin();
  }, [router]);

  useEffect(() => {
    if (isAdmin) {
      const debounce = setTimeout(() => fetchUsers(1), 300);
      return () => clearTimeout(debounce);
    }
  }, [search, roleFilter, isAdmin]);

  const handleDelete = async (userId: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      setTotal(prev => prev - 1);
    }
    setDeleteConfirm(null);
  };

  const handleEditSuccess = () => { fetchUsers(page); setEditUser(null); };
  const handleCreateSuccess = () => { fetchUsers(1); setCreateOpen(false); };

  if (!isAdmin) return (
    <div className="min-h-screen bg-[#FBF7F1] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#8B1A1A]" />
    </div>
  );

  return (
    <div className="space-y-8">
      {createOpen && <CreateUserModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSuccess={handleCreateSuccess} />}
      {editUser && <EditUserModal user={editUser} isOpen={!!editUser} onClose={() => setEditUser(null)} onSuccess={handleEditSuccess} />}
      {resetUser && <ResetPassModal user={resetUser} isOpen={!!resetUser} onClose={() => setResetUser(null)} />}
      {deleteConfirm && (
        <ModalPortal>
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <motion.div initial={{ scale: 0.95 }} className="w-full max-w-sm overflow-hidden rounded-[32px] bg-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center"><Trash2 size={24} className="text-red-600" /></div>
              <div>
                <h2 className="font-bold text-[#1a0505]">Hapus User?</h2>
                <p className="text-xs text-[#3a1a1a]/50">{deleteConfirm.full_name}</p>
              </div>
            </div>
            <p className="text-sm text-[#3a1a1a]/60">User akan dihapus permanen. Aksi ini tidak bisa dibatalkan.</p>
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
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B1A1A]">Manajemen User</span>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1a0505] mt-1" style={{ fontFamily: "Fraunces, serif" }}>Users & Roles</h1>
          <p className="text-sm text-[#3a1a1a]/50 mt-1">{total} total user</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8B1A1A] text-white text-sm font-semibold hover:bg-[#6B1212] transition-all">
          <Plus size={16} /> Tambah User
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B1A1A]/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau email..." className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#8B1A1A]/10 bg-white text-sm outline-none focus:border-[#8B1A1A]/30" />
        </div>
        <div className="flex rounded-2xl border border-[#8B1A1A]/10 bg-white overflow-hidden">
          <button onClick={() => setRoleFilter("")} className={`px-4 py-3 text-xs font-bold transition-all ${!roleFilter ? "bg-[#8B1A1A] text-white" : "text-[#3a1a1a]/50 hover:bg-[#FBF7F1]"}`}>All</button>
          <button onClick={() => setRoleFilter("client")} className={`px-4 py-3 text-xs font-bold transition-all ${roleFilter === "client" ? "bg-[#8B1A1A] text-white" : "text-[#3a1a1a]/50 hover:bg-[#FBF7F1]"}`}>Client</button>
          <button onClick={() => setRoleFilter("admin")} className={`px-4 py-3 text-xs font-bold transition-all ${roleFilter === "admin" ? "bg-[#8B1A1A] text-white" : "text-[#3a1a1a]/50 hover:bg-[#FBF7F1]"}`}>Admin</button>
        </div>
        <button onClick={() => fetchUsers(page)} className="p-3 rounded-2xl border border-[#8B1A1A]/10 bg-white text-[#8B1A1A] hover:bg-[#8B1A1A]/5 transition-all"><RefreshCw size={18} /></button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#8B1A1A]" size={32} /></div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#8B1A1A]/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FBF7F1] text-[#3a1a1a]/50 text-xs uppercase tracking-wide">
                  <th className="px-6 py-3 text-left font-bold">User</th>
                  <th className="px-6 py-3 text-left font-bold">Role</th>
                  <th className="px-6 py-3 text-left font-bold">WhatsApp</th>
                  <th className="px-6 py-3 text-left font-bold">Bergabung</th>
                  <th className="px-6 py-3 text-right font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#8B1A1A]/5">
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-[#3a1a1a]/30">Tidak ada user</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="hover:bg-[#FBF7F1]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B1A1A] to-[#6B1212] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(u.full_name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1a0505]">{u.full_name || "-"}</p>
                          <p className="text-xs text-[#3a1a1a]/40">{u.email || ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${ROLE_COLOR[u.role] ?? "bg-gray-100 text-gray-500"}`}>
                        {u.role === "admin" ? <Shield size={12} /> : <User size={12} />}
                        {ROLE_LABEL[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#3a1a1a]/60">{u.phone_whatsapp || "-"}</td>
                    <td className="px-6 py-4 text-xs text-[#3a1a1a]/50">{u.created_at ? new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditUser(u)} className="p-2 rounded-xl border border-[#8B1A1A]/20 text-[#8B1A1A] hover:bg-[#8B1A1A]/5 transition-all"><UserCog size={16} /></button>
                        <button onClick={() => setResetUser(u)} className="p-2 rounded-xl border border-[#8B1A1A]/20 text-[#8B1A1A] hover:bg-[#8B1A1A]/5 transition-all"><KeyRound size={16} /></button>
                        <button onClick={() => setDeleteConfirm(u)} className="p-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#8B1A1A]/10">
              <span className="text-xs text-[#3a1a1a]/50">Halaman {page} dari {totalPages}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => fetchUsers(page - 1)} disabled={page <= 1} className="p-2 rounded-full border border-[#8B1A1A]/20 text-xs disabled:opacity-50"><ChevronLeft size={14} /></button>
                <button onClick={() => fetchUsers(page + 1)} disabled={page >= totalPages} className="p-2 rounded-full border border-[#8B1A1A]/20 text-xs disabled:opacity-50"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}