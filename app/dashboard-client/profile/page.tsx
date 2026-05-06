"use client";

import React, { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browse";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  ShieldCheck,
  Edit2
} from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
    };
    getUser();
  }, [supabase]);

  return (
    <div className="max-w-4xl mx-auto space-y-8" style={{ fontFamily: "var(--font-inter-tight)" }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-[#1a0505]" style={{ fontFamily: "var(--font-fraunces)" }}>
          Profil <span className="italic text-[#8B1A1A]">Pengguna</span>
        </h1>
        <p className="text-[#3a1a1a]/60 text-sm">Informasi akun dan pengaturan preferensi Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[32px] border border-[#8B1A1A]/10 p-8 text-center space-y-4">
            <div className="relative mx-auto w-32 h-32">
              <div className="w-full h-full rounded-full bg-[#FBF7F1] border-2 border-[#8B1A1A]/10 flex items-center justify-center overflow-hidden">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-[#8B1A1A]/20" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-[#8B1A1A] text-white rounded-full border-4 border-white shadow-lg">
                <Camera size={16} />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1a0505]">{user?.user_metadata?.full_name || "Pelanggan PAMA"}</h2>
              <p className="text-sm text-[#3a1a1a]/50 italic">Member sejak 2024</p>
            </div>
            <div className="pt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100">
                <ShieldCheck size={12} /> Akun Terverifikasi
              </span>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[32px] border border-[#8B1A1A]/10 overflow-hidden">
            <div className="px-8 py-6 border-b border-[#8B1A1A]/5 flex items-center justify-between">
              <h3 className="font-bold text-[#1a0505]">Informasi Personal</h3>
              <button className="text-[10px] font-bold text-[#8B1A1A] uppercase tracking-widest flex items-center gap-1 hover:opacity-70">
                <Edit2 size={12} /> Edit Profil
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#3a1a1a]/40 uppercase tracking-[0.2em]">Nama Lengkap</label>
                  <div className="flex items-center gap-3 text-[#1a0505] font-medium">
                    <User size={18} className="text-[#8B1A1A]/40" />
                    <span>{user?.user_metadata?.full_name || "-"}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#3a1a1a]/40 uppercase tracking-[0.2em]">Alamat Email</label>
                  <div className="flex items-center gap-3 text-[#1a0505] font-medium">
                    <Mail size={18} className="text-[#8B1A1A]/40" />
                    <span>{user?.email || "-"}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#3a1a1a]/40 uppercase tracking-[0.2em]">Nomor WhatsApp</label>
                  <div className="flex items-center gap-3 text-[#1a0505] font-medium">
                    <Phone size={18} className="text-[#8B1A1A]/40" />
                    <span>{user?.user_metadata?.phone || "Belum diatur"}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#3a1a1a]/40 uppercase tracking-[0.2em]">Lokasi</label>
                  <div className="flex items-center gap-3 text-[#1a0505] font-medium">
                    <MapPin size={18} className="text-[#8B1A1A]/40" />
                    <span>Malang, Indonesia</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-[#FBF7F1] rounded-2xl border border-[#8B1A1A]/5">
                <p className="text-[11px] text-[#3a1a1a]/60 leading-relaxed italic">
                  Data Anda digunakan untuk mempermudah proses booking dan pengiriman file foto hasil sesi di PAMA Studio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}