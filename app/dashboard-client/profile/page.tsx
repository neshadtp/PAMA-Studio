"use client";

import React, { useEffect, useState } from "react";
import {
  User, Mail, Phone, MapPin, Camera, ShieldCheck, Edit2, Loader2, LogOut, ArrowRight, X, Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabase-browser";

export default function ProfilePage() {
  const { user, profile, ready, logout, reload } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { alert("Ukuran file maksimal 2MB"); return; }

    const supabase = createSupabaseBrowserClient();
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { alert("Gagal upload foto"); return; }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);

    await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", user.id);
  };

  const handleEditOpen = () => {
    setEditName(profile?.full_name || "");
    setEditPhone(profile?.phone || "");
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!user) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: editName, phone_whatsapp: editPhone })
      .eq("id", user.id);

    if (error) {
      alert("Gagal menyimpan profil");
    } else {
      setEditOpen(false);
      await reload();
    }
    setSaving(false);
  };

  useEffect(() => {
    if (ready && !user) {
      router.push("/");
    } else if (ready && user) {
      setLoading(false);
      if (profile?.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      }
    }
  }, [ready, user, router, profile]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading || !ready) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#8B1A1A]" size={32} />
      </div>
    );
  }

  const userInitials = profile?.full_name
    ? profile.full_name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  const memberSince = new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="max-w-4xl mx-auto space-y-8" style={{ fontFamily: "Inter Tight, sans-serif" }}>
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B1A1A]">Pengaturan Akun</span>
        <h1 className="text-3xl font-serif text-[#1a0505] mt-1" style={{ fontFamily: "Fraunces, serif" }}>
          Profil <span className="italic text-[#8B1A1A]">Pengguna</span>
        </h1>
        <p className="text-sm text-[#3a1a1a]/50 mt-1">Informasi akun dan pengaturan preferensi Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] border border-[#8B1A1A]/10 p-8 text-center space-y-6 shadow-sm"
          >
            <div className="relative mx-auto w-32 h-32">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#8B1A1A] to-[#6B1212] flex items-center justify-center text-white text-3xl font-bold">
                  {userInitials}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 bg-white text-[#8B1A1A] rounded-full border-4 border-white shadow-lg hover:bg-[#FBF7F1] transition-all"
              >
                <Camera size={16} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1a0505]">{profile?.full_name || "Pelanggan PAMA"}</h2>
              <p className="text-sm text-[#3a1a1a]/50 italic">Member sejak {memberSince}</p>
            </div>
            <div className="pt-4">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider border border-green-100">
                <ShieldCheck size={14} /> Akun Terverifikasi
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-all"
            >
              <LogOut size={16} /> Keluar dari Akun
            </button>
          </motion.div>
        </div>

        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[32px] border border-[#8B1A1A]/10 overflow-hidden shadow-sm"
          >
            <div className="px-8 py-6 border-b border-[#8B1A1A]/5 flex items-center justify-between">
              <h3 className="font-bold text-[#1a0505]">Informasi Personal</h3>
              <button
                onClick={handleEditOpen}
                className="flex items-center gap-1.5 text-[10px] font-bold text-[#8B1A1A] uppercase tracking-widest hover:opacity-70 transition-all"
              >
                <Edit2 size={12} /> Edit Profil
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#3a1a1a]/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <User size={12} className="text-[#8B1A1A]/30" /> Nama Lengkap
                  </label>
                  <p className="text-[#1a0505] font-semibold text-base">{profile?.full_name || "-"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#3a1a1a]/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Mail size={12} className="text-[#8B1A1A]/30" /> Alamat Email
                  </label>
                  <p className="text-[#1a0505] font-semibold text-base">{user?.email || "-"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#3a1a1a]/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Phone size={12} className="text-[#8B1A1A]/30" /> Nomor WhatsApp
                  </label>
                  <p className="text-[#1a0505] font-semibold text-base">{profile?.phone || "Belum diatur"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#3a1a1a]/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <MapPin size={12} className="text-[#8B1A1A]/30" /> Lokasi
                  </label>
                  <p className="text-[#1a0505] font-semibold text-base">Malang, Indonesia</p>
                </div>
              </div>

              <div className="mt-8 p-5 bg-[#FBF7F1] rounded-2xl border border-[#8B1A1A]/5">
                <p className="text-[11px] text-[#3a1a1a]/60 leading-relaxed">
                  Data Anda digunakan untuk mempermudah proses booking dan pengiriman file foto hasil sesi di PAMA Studio.
                </p>
              </div>

              <div className="pt-4 border-t border-[#8B1A1A]/10">
                <h4 className="text-sm font-bold text-[#1a0505] mb-4">Aksi Cepat</h4>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/dashboard-client/orders"
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#8B1A1A]/10 text-[#8B1A1A] text-sm font-semibold rounded-full hover:bg-[#8B1A1A]/20 transition-all"
                  >
                    Lihat Pesanan <ArrowRight size={14} />
                  </a>
                  <a
                    href="/paket"
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#8B1A1A] text-white text-sm font-semibold rounded-full hover:bg-[#6B1212] transition-all"
                  >
                    Pesan Paket Baru <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Edit Profil Modal */}
      <AnimatePresence>
        {editOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
            onClick={() => setEditOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl border border-[#8B1A1A]/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#1a0505]" style={{ fontFamily: "Fraunces, serif" }}>
                  Edit Profil
                </h3>
                <button
                  onClick={() => setEditOpen(false)}
                  className="p-2 rounded-full hover:bg-[#8B1A1A]/5 text-[#3a1a1a]/40 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#3a1a1a]/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <User size={12} className="text-[#8B1A1A]/30" /> Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nama lengkap kamu"
                    className="w-full px-4 py-3 rounded-2xl border border-[#8B1A1A]/20 bg-[#FBF7F1] text-[#1a0505] text-sm font-semibold focus:outline-none focus:border-[#8B1A1A]/50 transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#3a1a1a]/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Phone size={12} className="text-[#8B1A1A]/30" /> Nomor WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-3 rounded-2xl border border-[#8B1A1A]/20 bg-[#FBF7F1] text-[#1a0505] text-sm font-semibold focus:outline-none focus:border-[#8B1A1A]/50 transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#3a1a1a]/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Mail size={12} className="text-[#8B1A1A]/30" /> Alamat Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-4 py-3 rounded-2xl border border-[#8B1A1A]/10 bg-[#f0ebe4] text-[#3a1a1a]/40 text-sm font-semibold cursor-not-allowed"
                  />
                  <p className="text-[10px] text-[#3a1a1a]/40">Email tidak dapat diubah</p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setEditOpen(false)}
                  className="flex-1 px-4 py-3 rounded-2xl border border-[#8B1A1A]/20 text-[#8B1A1A] text-sm font-semibold hover:bg-[#8B1A1A]/5 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#8B1A1A] text-white text-sm font-semibold hover:bg-[#6B1212] transition disabled:opacity-60"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}