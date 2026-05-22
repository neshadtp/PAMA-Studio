"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";
import Image from "next/image";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout, ready } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  const userInitials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((w: string) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard-client" },
    { label: "Pesanan Saya", icon: ShoppingBag, href: "/dashboard-client/orders" },
    { label: "Profil", icon: User, href: "/dashboard-client/profile" },
  ];

  return (
    <div className="min-h-screen bg-[#FBF7F1] flex">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#8B1A1A]/10 transform transition-transform duration-300 lg:relative lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-full flex flex-col p-6">
          {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl">
            <Image src="/logo.png" alt="Logo PAMA" fill className="object-contain" />
          </div>
          <span className="font-serif text-xl text-[#1a0505] font-bold" style={{ fontFamily: "var(--font-fraunces)" }}>
            PAMA <span className="italic text-[#8B1A1A]">Studio</span>
          </span>
        </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all
                    ${
                      isActive
                        ? "bg-[#8B1A1A] text-white shadow-lg shadow-[#8B1A1A]/20"
                        : "text-[#3a1a1a]/60 hover:bg-[#8B1A1A]/5 hover:text-[#8B1A1A]"
                    }
                  `}
                  style={{ fontFamily: "Inter Tight, sans-serif" }}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 pt-6 border-t border-[#8B1A1A]/10">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[#3a1a1a]/60 hover:bg-[#8B1A1A]/5 hover:text-[#8B1A1A] transition-colors mb-4"
            >
              <Home size={18} />
              <span className="text-sm font-semibold">Kembali ke Beranda</span>
            </Link>
            {ready && (
              <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B1A1A] text-white text-sm font-bold overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  userInitials
                )}
              </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate text-[#1a0505]">{profile?.full_name ?? "User"}</p>
                  <p className="text-xs text-[#8B1A1A]/60 capitalize">{profile?.role ?? "Client"}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors w-full"
            >
              <LogOut size={20} />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#8B1A1A]/10 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#8B1A1A] text-lg" style={{ fontFamily: "Fraunces, serif" }}>PAMA</span>
            <span className="text-xs text-[#3a1a1a]/50">Client</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-[#8B1A1A] hover:bg-[#8B1A1A]/5 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}