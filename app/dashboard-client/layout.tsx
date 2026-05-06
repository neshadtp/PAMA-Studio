"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sparkles 
} from "lucide-react";
import Image from "next/image";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard-client" },
    { label: "Pesanan Saya", icon: ShoppingBag, href: "/dashboard-client/orders" },
    { label: "Profil", icon: User, href: "/dashboard-client/profile" },
  ];

  return (
    <div className="min-h-screen bg-[#FBF7F1] flex">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#8B1A1A]/10 transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
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

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all
                    ${isActive 
                      ? "bg-[#8B1A1A] text-white shadow-lg shadow-[#8B1A1A]/20" 
                      : "text-[#3a1a1a]/60 hover:bg-[#8B1A1A]/5 hover:text-[#8B1A1A]"}
                  `}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <button className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors mt-auto">
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar Mobile */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#8B1A1A]/10">
          <span className="font-serif font-bold text-[#8B1A1A]" style={{ fontFamily: "var(--font-fraunces)" }}>PAMA</span>
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-[#8B1A1A]">
            <Menu size={24} />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}