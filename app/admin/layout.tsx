"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Clock,
  Camera,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Package,
  Home,
  FileText,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { name: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { name: "Operational", icon: Users, path: "/admin/operational" },
  { name: "Automation", icon: Clock, path: "/admin/automation" },
  { name: "Photographers", icon: Camera, path: "/admin/photographers" },
  { name: "Packages", icon: Package, path: "/admin/packages" },
  { name: "Page Management", icon: FileText, path: "/admin/pagemanagement" },
  { name: "Settings", icon: Settings, path: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout, ready } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  const userInitials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((w: string) => w.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SA";

  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex h-screen bg-[#FBF7F1] overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-[#8B1A1A] text-white transform transition-transform duration-300 lg:relative lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-white/20">
              <Image src="/logo.png" alt="Logo PAMA" fill className="object-contain p-1" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-wide" style={{ fontFamily: "Fraunces, serif" }}>PAMA</span>
              <span className="text-xs text-red-200 block -mt-0.5">Studio Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden p-2 rounded-full hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200
                    ${isActive
                      ? "bg-[#6B1212] text-white shadow-lg shadow-black/10"
                      : "text-red-100 hover:bg-[#6B1212]/50 hover:text-white"
                    }
                  `}
                  style={{ fontFamily: "Inter Tight, sans-serif" }}
                >
                  <item.icon size={20} />
                  <span className="font-semibold text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 pt-6 border-t border-[#6B1212]">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-100 hover:bg-[#6B1212]/50 transition-colors mb-4"
            >
              <Home size={18} />
              <span className="text-sm font-semibold">Landing Page</span>
            </Link>
            {ready && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#8B1A1A] text-sm font-bold">
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{profile?.full_name ?? "Admin"}</p>
                  <p className="text-xs text-red-200 capitalize">{profile?.role ?? "Administrator"}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-3 text-red-100 hover:bg-[#6B1212]/50 rounded-2xl transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-[#6B1212] text-center">
            <p className="text-xs text-red-300">© 2025 PAMA STUDIO</p>
            <p className="text-[10px] text-red-400 mt-1">Admin Panel v1.0</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-[#8B1A1A]/10 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-[#8B1A1A] hover:bg-[#8B1A1A]/5 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm text-[#3a1a1a]/50">
              <span>{today}</span>
              <span className="text-[#8B1A1A]/30">•</span>
              <span className="font-medium text-[#8B1A1A]">{currentTime}</span>
            </div>
          </div>

          <div className="relative w-64 md:w-96 hidden sm:block">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B1A1A]/30"
              size={16}
            />
            <input
              type="text"
              placeholder="Search orders, packages, customers..."
              className="w-full pl-10 pr-4 py-2 bg-[#FBF7F1] border border-[#8B1A1A]/10 rounded-full text-sm focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]/30 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/admin/notifications"
              className="relative p-2 text-[#3a1a1a]/50 hover:bg-[#8B1A1A]/5 rounded-lg transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </a>
            {ready && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-[#8B1A1A] text-white text-xs font-bold">
                  {userInitials}
                </div>
                <span className="text-sm font-medium text-[#1a0505] hidden md:block">
                  {profile?.full_name ?? "Admin"}
                </span>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 bg-[#FBF7F1]">{children}</div>
      </main>
    </div>
  );
}