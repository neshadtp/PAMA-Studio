"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browse";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export default function AuthModal({ isOpen, onClose, title, subtitle }: { isOpen: boolean; onClose: () => void; title?: string; subtitle?: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setError("");
      setLoading(false);
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // 🔹 Helper
  const getCleanEmail = () => form.email.trim().toLowerCase();

  const validate = () => {
    if (!form.email || !form.password) return "Email dan password wajib diisi.";
    if (mode === "register" && !form.name.trim()) return "Nama wajib diisi.";
    if (form.password.length < 6) return "Password minimal 6 karakter.";
    return "";
  };

  // 🔥 HANDLE REGISTER
  const handleRegister = async () => {
    const email = getCleanEmail();

    const { data, error } = await supabase.auth.signUp({
      email,
      password: form.password,
    });

    if (error) {
      // handle duplicate email (fix dari kasus kamu)
      if (error.message.includes("duplicate")) {
        throw new Error("Email sudah terdaftar. Silakan login.");
      }
      throw error;
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: form.name.trim(),
        email,
        role: "client",
      });
    }

    setMode("login");
    throw new Error("Registrasi berhasil! Silakan login.");
  };

  // 🔥 HANDLE LOGIN
  const handleLogin = async () => {
    const email = getCleanEmail();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: form.password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Email atau password salah.");
      }
      throw error;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const role = profile?.role || "client";

    onClose();
    router.push(role === "admin" ? "/admin" : "/paket");
    router.refresh();
  };

  // 🔥 MAIN SUBMIT
  const handleSubmit = async () => {
    setError("");

    const validation = validate();
    if (validation) return setError(validation);

    setLoading(true);
    try {
      if (mode === "register") {
        await handleRegister();
      } else {
        await handleLogin();
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/30 bg-white/90 shadow-2xl backdrop-blur-xl flex flex-col lg:flex-row">
        <div className="relative hidden lg:block lg:w-[40%]">
          <Image src="/images/foto6.jpg" alt="PAMA" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
        </div>

        <div className="relative flex-1 p-8">
          <button onClick={onClose} className="absolute right-6 top-6 text-[#8B1A1A]">
            <X className="h-5 w-5" />
          </button>

          {title && <h2 className="text-2xl font-bold mb-2 text-[#1a0505]">{title}</h2>}
          {subtitle && <p className="text-sm text-gray-600 mb-6">{subtitle}</p>}
          {!title && <h2 className="text-2xl font-bold mb-6 text-[#1a0505]">
            {mode === "login" ? "Masuk" : "Daftar Akun"}
          </h2>}

          <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 rounded-lg py-2 text-[10px] font-bold uppercase transition-all ${
                  mode === m ? "bg-[#8B1A1A] text-white shadow-md" : "text-gray-400"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mode === "register" && (
              <div className="flex items-center gap-3 rounded-xl border p-3 bg-white">
                <User className="h-4 w-4 text-[#8B1A1A]" />
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full text-sm outline-none"
                  placeholder="Nama Lengkap"
                />
              </div>
            )}

            <div className="flex items-center gap-3 rounded-xl border p-3 bg-white">
              <Mail className="h-4 w-4 text-[#8B1A1A]" />
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full text-sm outline-none"
                placeholder="Email"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border p-3 bg-white">
              <Lock className="h-4 w-4 text-[#8B1A1A]" />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full text-sm outline-none"
                placeholder="Password"
              />
              <button onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-[10px] text-red-600 font-bold text-center leading-tight">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-8 bg-[#8B1A1A] text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#6B1212] transition-all disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "MASUK" : "DAFTAR"}
          </button>
        </div>
      </div>
    </div>
  );
}