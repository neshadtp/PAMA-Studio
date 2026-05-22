"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabase-browser";
import {
  User, Building2, Calendar, Bell, Shield, Monitor,
  Database, Download, Users, Save, Loader2, Eye, EyeOff,
} from "lucide-react";

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors ${value ? "bg-[#8B1A1A]" : "bg-gray-200"}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? "left-7" : "left-1"}`} />
    </button>
  );
}

export default function SettingsPage() {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Account
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Administrator");
  const [newPassword, setNewPassword] = useState("");

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifWA, setNotifWA] = useState(true);
  const [notifNewOrder, setNotifNewOrder] = useState(true);
  const [notifFailedPayment, setNotifFailedPayment] = useState(true);

  // Studio
  const [studioName, setStudioName] = useState("PAMA Studio");
  const [studioPhone, setStudioPhone] = useState("+62 821 xxxxx");
  const [studioAddress, setStudioAddress] = useState("Benda, Banjarbendo, Kabupaten Sidoarjo");
  const [openTime, setOpenTime] = useState("09:30");
  const [closeTime, setCloseTime] = useState("21:00");
  const [timezone, setTimezone] = useState("(GMT+07:00) Sidoarjo");

  // Security
  const [twoFA, setTwoFA] = useState(false);

  // Booking
  const [autoAccept, setAutoAccept] = useState(true);
  const [maxBooking, setMaxBooking] = useState("25");
  const [cancelLimit, setCancelLimit] = useState("24 Jam Sebelum");
  const [paymentDeadline, setPaymentDeadline] = useState("1 Jam Setelah Booking");
  const [reminderNotif, setReminderNotif] = useState("Aktif (Email & WA)");

  // Theme
  const [theme, setTheme] = useState<"Light" | "Dark">("Light");
  const [language, setLanguage] = useState("Bahasa Indonesia");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setEmail(user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();
      if (profile) {
        setFullName(profile.full_name ?? "");
        setRole(profile.role === "admin" ? "Administrator" : "Client");
      }
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
        if (newPassword.length >= 6) {
          await supabase.auth.updateUser({ password: newPassword });
          setNewPassword("");
        }
      }
      alert("Perubahan berhasil disimpan!");
    } catch {
      alert("Gagal menyimpan perubahan.");
    }
    setSaving(false);
  };

  const exportData = (type: string) => {
    alert(`Export ${type} akan segera diunduh.`);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-[#8B1A1A]" size={32} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#8B1A1A] text-xs font-bold uppercase tracking-widest">Admin Settings</p>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">Preferences</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B1A1A] text-white text-sm font-bold hover:bg-[#6B1212] transition disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Simpan Perubahan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* Pengaturan Akun */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <User size={20} className="text-[#8B1A1A]" />
              </div>
              <h2 className="font-bold text-gray-800">Pengaturan Akun</h2>
            </div>

            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-[#8B1A1A] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {fullName ? fullName.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase() : "A"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Nama Lengkap</label>
                    <input
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Email Address</label>
                    <input
                      value={email}
                      disabled
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 text-gray-500 outline-none"
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</span>
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-[#8B1A1A] uppercase">{role}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Ubah Password</label>
              <div className="relative max-w-sm">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Password baru (min. 6 karakter)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 pr-10"
                />
                <button onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-2.5 text-gray-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {newPassword.length > 0 && newPassword.length < 6 && (
                <p className="text-xs text-red-500 mt-1">Password minimal 6 karakter</p>
              )}
            </div>
          </div>

          {/* Pengaturan Studio */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Building2 size={20} className="text-[#8B1A1A]" />
              </div>
              <h2 className="font-bold text-gray-800">Pengaturan Studio</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Nama Lengkap</label>
                <input value={studioName} onChange={e => setStudioName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Nomor Kontak</label>
                <input value={studioPhone} onChange={e => setStudioPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Alamat</label>
                <input value={studioAddress} onChange={e => setStudioAddress(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Jam Operasional</label>
                <div className="flex items-center gap-2">
                  <input value={openTime} onChange={e => setOpenTime(e.target.value)} type="time"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20" />
                  <span className="text-gray-400">-</span>
                  <input value={closeTime} onChange={e => setCloseTime(e.target.value)} type="time"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20" />
                  <span className="text-xs text-gray-400 font-semibold">WIB</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Zona Waktu</label>
                <select value={timezone} onChange={e => setTimezone(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 bg-white">
                  <option>(GMT+07:00) Sidoarjo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pengaturan Pemesanan */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Calendar size={20} className="text-[#8B1A1A]" />
              </div>
              <h2 className="font-bold text-gray-800">Pengaturan Pemesanan</h2>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
              <div>
                <p className="text-sm font-bold text-gray-800">Auto Accept Booking</p>
                <p className="text-xs text-gray-400 mt-0.5">Otomatis setujui pesanan setelah pembayaran terverifikasi</p>
              </div>
              <div className="flex items-center gap-3">
                <Toggle value={autoAccept} onChange={setAutoAccept} />
                <span className={`text-xs font-bold ${autoAccept ? "text-[#8B1A1A]" : "text-gray-400"}`}>
                  {autoAccept ? "ON" : "OFF"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Max Booking Per Hari</label>
                <input value={maxBooking} onChange={e => setMaxBooking(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 text-[#8B1A1A] font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Batas Pembatalan</label>
                <input value={cancelLimit} onChange={e => setCancelLimit(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Deadline Pembayaran</label>
                <input value={paymentDeadline} onChange={e => setPaymentDeadline(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Notifikasi Pengingat</label>
                <input value={reminderNotif} onChange={e => setReminderNotif(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* Notifikasi */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Bell size={20} className="text-[#8B1A1A]" />
              </div>
              <h2 className="font-bold text-gray-800">Pengaturan Notifikasi</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Notifikasi Email", value: notifEmail, onChange: setNotifEmail },
                { label: "Notifikasi WhatsApp", value: notifWA, onChange: setNotifWA },
                { label: "Alert Pesanan Baru", value: notifNewOrder, onChange: setNotifNewOrder },
                { label: "Notifikasi Gagal Bayar", value: notifFailedPayment, onChange: setNotifFailedPayment },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <Toggle value={item.value} onChange={item.onChange} />
                </div>
              ))}
            </div>
          </div>

          {/* Keamanan */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Shield size={20} className="text-[#8B1A1A]" />
              </div>
              <h2 className="font-bold text-gray-800">Keamanan</h2>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">Two-Factor Auth (2FA)</p>
                <p className="text-xs text-gray-400">Login via App & WhatsApp</p>
              </div>
              <Toggle value={twoFA} onChange={setTwoFA} />
            </div>
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-semibold uppercase tracking-widest">Login Terakhir</span>
                <span className="text-gray-400 font-semibold uppercase tracking-widest">Sesi Aktif</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700 font-medium">Hari ini, 08:42 WIB</span>
                <span className="text-sm font-bold text-[#8B1A1A]">3 Perangkat</span>
              </div>
            </div>
            <button className="mt-3 w-full py-2 rounded-xl border border-red-200 text-[#8B1A1A] text-xs font-bold hover:bg-red-50 transition">
              Logout dari Semua Perangkat
            </button>
          </div>

          {/* Tampilan */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Monitor size={20} className="text-[#8B1A1A]" />
              </div>
              <h2 className="font-bold text-gray-800">Tampilan</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Theme</label>
                <div className="flex gap-2">
                  {(["Light", "Dark"] as const).map(t => (
                    <button key={t} onClick={() => setTheme(t)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${theme === t ? "bg-[#8B1A1A] text-white" : "bg-gray-100 text-gray-500"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Bahasa</label>
                <select value={language} onChange={e => setLanguage(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 bg-white">
                  <option>Bahasa Indonesia</option>
                  <option>English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Backup & Export */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-[#8B1A1A]" />
                <span className="text-xs font-bold text-gray-800 uppercase tracking-widest">Backup & Export Data</span>
              </div>
              <span className="text-[10px] text-gray-400">Last backup: 12 minutes ago</span>
            </div>
            <div className="space-y-3">
              <button onClick={() => exportData("orders")}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <Download size={16} className="text-[#8B1A1A]" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Export Data</span>
              </button>
              <button onClick={() => exportData("customers")}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <Users size={16} className="text-[#8B1A1A]" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Customer Data</span>
              </button>
              <button onClick={() => exportData("database")}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#8B1A1A] hover:bg-[#6B1212] transition">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Database size={16} className="text-white" />
                </div>
                <span className="text-sm font-bold text-white">Backup Database</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}