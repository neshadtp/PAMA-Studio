"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Menu, X, ShoppingBag, ArrowUpRight, User, LogOut, LayoutDashboard } from "lucide-react";
import AuthModal from "@/components/ui/AuthModal";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browse";

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: p } = await supabase.from("profiles").select("full_name, email").eq("id", user.id).single();
        setProfile(p);
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: p } = await supabase.from("profiles").select("full_name, email").eq("id", session.user.id).single();
        setProfile(p);
      } else {
        setProfile(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePesanClick = async () => {
    if (user) router.push("/paket");
    else setAuthOpen(true);
  };

 const handleLogout = async () => {
  console.log("logout clicked");
  const { error } = await supabase.auth.signOut();
  console.log("signOut result:", error);
  setDropdownOpen(false);
  router.push("/");
  router.refresh();
};

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const links = [
    { label: "Beranda", href: "/#beranda" },
    { label: "Portofolio", href: "/#portofolio" },
    { label: "Paket", href: "/#paket" },
    { label: "Kontak", href: "/#kontak" },
  ];

  return (
    <>
      <header className={["fixed top-0 left-0 right-0 z-50 transition-all duration-500", scrolled ? "py-3" : "py-5"].join(" ")}>
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className={["relative flex items-center justify-between rounded-full border transition-all duration-500",
            scrolled ? "border-white/40 bg-[#ffffff]/90 backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(120,20,20,0.25)] px-4 py-2"
              : "border-white/30 bg-[#ffffff]/70 backdrop-blur-md px-5 py-3"].join(" ")}>

            {/* Logo */}
            <a href="#beranda" className="flex items-center gap-2 pl-1">
              <div className="relative h-11 w-11 flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-[#8B1A1A]/10 blur-sm" />
                <div className="absolute inset-0 rounded-full border border-[#8B1A1A]/25 z-10" />
                <div className="relative h-full w-full overflow-hidden rounded-full bg-white">
                  <Image src="/logo.png" alt="Logo PAMA" fill className="object-contain p-1" />
                </div>
              </div>
              <div className="leading-none">
                <div className="text-[17px] font-semibold text-[#2a0a0a]">PAMA</div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-[#8B1A1A]/80">Studio</div>
              </div>
            </a>

            {/* Desktop links */}
            <nav className="hidden items-center gap-1 md:flex">
              {links.map(l => (
                <a key={l.label} href={l.href} className="rounded-full px-4 py-2 text-sm font-medium text-[#2a0a0a]/80 hover:text-[#8B1A1A] transition">
                  {l.label}
                </a>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button onClick={handlePesanClick} className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#8B1A1A] to-[#6B1212] px-5 py-2.5 text-sm font-medium text-white">
                Pesan <ArrowUpRight className="h-3.5 w-3.5" />
              </button>

              {user ? (
                <>
                  {/* Shopping bag */}
                  <button onClick={() => router.push("/dashboard-client")} className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-[#8B1A1A]/20 bg-white/70 text-[#8B1A1A]">
                    <ShoppingBag className="h-4 w-4" />
                  </button>

                  {/* Profile dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setDropdownOpen(v => !v)}
                      className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-[#8B1A1A] text-white text-sm font-bold hover:bg-[#6B1212] transition">
                      {initials}
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-800 truncate">{profile?.full_name ?? "User"}</p>
                          <p className="text-xs text-gray-400 truncate">{profile?.email ?? ""}</p>
                        </div>
                        <button onClick={() => { router.push("/dashboard-client"); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
                          <LayoutDashboard size={16} /> Dashboard
                        </button>
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition">
                          <LogOut size={16} /> Keluar
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button onClick={() => setAuthOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#8B1A1A]/20 bg-white/70 px-4 py-2 text-sm font-medium text-[#8B1A1A] hover:bg-white transition">
                  <User className="h-4 w-4" /> Masuk
                </button>
              )}

              <button onClick={() => setMenuOpen(v => !v)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8B1A1A]/20 bg-white/70 text-[#8B1A1A] md:hidden">
                {menuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="mt-2 rounded-3xl border bg-white p-3 md:hidden">
              {links.map(l => (
                <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm text-gray-700">
                  {l.label}
                </a>
              ))}
              {user ? (
                <>
                  <button onClick={() => { router.push("/dashboard-client"); setMenuOpen(false); }}
                    className="mt-2 w-full flex items-center gap-2 rounded-2xl border border-[#8B1A1A]/20 px-4 py-3 text-sm text-[#8B1A1A]">
                    <LayoutDashboard size={16} /> Dashboard
                  </button>
                  <button onClick={handleLogout}
                    className="mt-2 w-full rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 font-semibold">
                    Keluar
                  </button>
                </>
              ) : (
                <button onClick={() => { setAuthOpen(true); setMenuOpen(false); }}
                  className="mt-2 w-full rounded-2xl border border-[#8B1A1A]/20 px-4 py-3 text-sm text-[#8B1A1A] font-semibold">
                  Masuk / Daftar
                </button>
              )}
              <button onClick={() => { setMenuOpen(false); handlePesanClick(); }}
                className="mt-2 w-full rounded-2xl bg-[#8B1A1A] px-4 py-3 text-white text-sm font-semibold">
                Pesan Sekarang
              </button>
            </div>
          )}
        </div>
      </header>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Navbar;