// app/admin/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  Users, 
  Clock, 
  Monitor, 
  FileText, 
  LogOut,
  Bell,
  Search
} from 'lucide-react';
import { useState } from 'react';
import Image from "next/image";

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  { name: 'Operational', icon: Users, path: '/admin/operational' },
  { name: 'Automation', icon: Clock, path: '/admin/automation' },
  { name: 'Monitoring', icon: Monitor, path: '/admin/monitoring' },
  { name: 'Page Management', icon: FileText, path: '/admin/pages' },
  { name: 'Master Data', icon: Settings, path: '/admin/packages' },
  { name: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* SIDEBAR MERAH */}
      <aside className="w-64 bg-red-600 text-white flex flex-col shadow-lg flex-shrink-0 z-20">
        {/* Logo Area */}
      <div className="p-6 border-b border-red-700 flex items-center gap-3">
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-white">
          <Image src="/logo.png" alt="Logo PAMA" fill className="object-contain p-1" />
        </div>
        <span className="font-bold text-xl tracking-wide">PAMA Studio</span>
      </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6 space-y-1 px-3 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-red-700 text-white shadow-md' 
                    : 'text-red-100 hover:bg-red-700 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Bottom */}
        <div className="p-4 border-t border-red-700 flex-shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="https://ui-avatars.com/api/?name=Super+Admin&background=random" 
              alt="User" 
              className="w-10 h-10 rounded-full border-2 border-white"
            />
            <div>
              <p className="text-sm font-semibold">SuperAdminZ</p>
              <p className="text-xs text-red-200">Administrator</p>
            </div>
          </div>
          
          <button className="flex items-center gap-2 w-full px-4 py-2 text-red-100 hover:bg-red-700 rounded-lg transition-colors">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
        
        {/* Copyright */}
        <div className="p-4 text-xs text-red-200 text-center border-t border-red-700 flex-shrink-0">
          © 2025 PAMA STUDIO<br/>All rights reserved.
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* HEADER PUTIH */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
          {/* Search Bar */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
            />
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
          <a href="/admin/notifications" className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </a>
            <div className="flex items-center gap-2">
               <img 
                src="https://ui-avatars.com/api/?name=Super+Admin&background=random" 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700 hidden md:block">SuperAdminZ</span>
            </div>
          </div>
        </header>

        {/* DYNAMIC CONTENT (Children) */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {children}
        </div>
      </main>
    </div>
  );
}