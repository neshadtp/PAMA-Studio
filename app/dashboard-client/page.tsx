"use client";

import React, { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browse";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  LayoutDashboard,
  AlertCircle,
  MessageCircle,
  X,
  Receipt
} from "lucide-react";
import Image from "next/image";

// Komponen Modal Detail Pesanan
const OrderDetailModal = ({ order, isOpen, onClose }: any) => {
  if (!isOpen || !order) return null;

  const handleWhatsApp = () => {
    const adminPhone = "6282331555431";
    const text = `Halo PAMA Studio! Saya ingin konfirmasi pesanan:\n\n*Order ID:* #${order.id.slice(0, 8)}\n*Paket:* ${order.packages?.title}\n*Status:* ${order.status}\n*Total:* Rp ${new Intl.NumberFormat("id-ID").format(order.total_price_idr)}\n\nMohon instruksi selanjutnya.`;
    window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-[#FBF7F1] shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Header Modal */}
        <div className="bg-[#8B1A1A] p-6 text-white">
          <button onClick={onClose} className="absolute right-6 top-6 text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Package size={24} />
            </div>
            <div>
              <h2 className="text-xl font-serif leading-tight" style={{ fontFamily: "Fraunces, serif" }}>Detail Pesanan</h2>
              <p className="text-xs text-white/70 uppercase tracking-widest font-medium mt-0.5">#{order.id.slice(0, 8)}</p>
            </div>
          </div>
        </div>

        {/* Content Modal */}
        <div className="p-8 space-y-6" style={{ fontFamily: "Inter Tight, sans-serif" }}>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B1A1A]/60">Status</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${order.status === 'pending' ? 'bg-amber-500' : 'bg-green-500'}`} />
                <span className="text-sm font-bold uppercase text-[#1a0505]">{order.status}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B1A1A]/60">Waktu Booking</p>
              <p className="mt-1 text-sm font-bold text-[#1a0505]">{order.booking_date || "Jadwal Admin"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#8B1A1A]/10 bg-white p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#8B1A1A]">
              <Receipt size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Rincian Pembayaran</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#3a1a1a]/60">{order.packages?.title}</span>
              <span className="font-bold text-[#1a0505]">Rp {new Intl.NumberFormat("id-ID").format(order.total_price_idr)}</span>
            </div>
            <div className="pt-3 border-t border-dashed border-[#8B1A1A]/20 flex justify-between items-center text-[#1a0505]">
              <span className="font-bold">Total Pembayaran</span>
              <span className="text-xl font-bold text-[#8B1A1A]">Rp {new Intl.NumberFormat("id-ID").format(order.total_price_idr)}</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-3">
            <button 
              onClick={handleWhatsApp}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[#25D366] py-4 text-sm font-bold text-white shadow-lg transition hover:bg-[#1da851] active:scale-95"
            >
              <MessageCircle size={18} />
              Chat Admin via WhatsApp
            </button>
            <p className="text-[11px] text-center text-[#3a1a1a]/40 italic">
              *Silakan chat admin jika Anda belum melakukan konfirmasi pembayaran.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ClientDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from("orders")
          .select("*, packages(title)")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
        setOrders(data || []);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [supabase]);

  const openDetail = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FBF7F1] pb-20">
      <OrderDetailModal 
        order={selectedOrder} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <div className="max-w-6xl mx-auto px-5 pt-10 space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8B1A1A]/15 bg-white/70 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#8B1A1A] backdrop-blur-sm mb-4">
              <LayoutDashboard size={14} /> Client Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-[#1a0505] leading-tight" style={{ fontFamily: "Fraunces, serif" }}>
              Halo, <span className="italic font-light text-[#8B1A1A]">Versi Terbaikmu!</span> ✨
            </h1>
            <p className="text-[#3a1a1a]/60 mt-2 text-sm md:text-base font-medium" style={{ fontFamily: "Inter Tight, sans-serif" }}>
              Kelola sesi fotomu dan pantau status pesanan dengan mudah.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Booking", value: orders.length, color: "bg-[#8B1A1A]" },
            { label: "Menunggu", value: orders.filter(o => o.status === 'pending').length, color: "bg-amber-500" },
            { label: "Selesai", value: orders.filter(o => o.status === 'completed').length, color: "bg-green-600" }
          ].map((stat, i) => (
            <div key={i} className="group relative overflow-hidden rounded-[32px] bg-white border border-[#8B1A1A]/10 p-8 shadow-sm transition-all hover:shadow-md">
              <div className={`absolute top-0 right-0 h-2 w-24 ${stat.color} opacity-20`} />
              <p className="text-xs font-bold text-[#3a1a1a]/40 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <p className="text-5xl font-serif text-[#1a0505]" style={{ fontFamily: "Fraunces, serif" }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Orders Table/List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#8B1A1A]/10 pb-4">
            <h3 className="text-xl font-serif text-[#1a0505]" style={{ fontFamily: "Fraunces, serif" }}>Pesanan Terbaru</h3>
            <span className="text-xs font-bold text-[#8B1A1A] uppercase tracking-widest bg-[#8B1A1A]/5 px-3 py-1 rounded-full">Live Update</span>
          </div>

          {loading ? (
            <div className="grid gap-4 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/50 rounded-3xl border border-[#8B1A1A]/5" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white/50 rounded-[32px] border border-dashed border-[#8B1A1A]/20 p-16 text-center">
              <div className="bg-[#8B1A1A]/5 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-[#8B1A1A]/40" size={32} />
              </div>
              <p className="text-[#3a1a1a]/60 font-medium mb-1">Belum ada riwayat pesanan.</p>
              <p className="text-[#3a1a1a]/40 text-sm">Ayo abadikan momen terbaikmu sekarang!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => openDetail(order)}
                  className="group w-full bg-white hover:bg-[#FBF7F1] transition-all p-6 rounded-[32px] border border-[#8B1A1A]/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl ${order.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                      <Package size={28} />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-[#8B1A1A] uppercase tracking-[0.2em] mb-1">#{order.id.slice(0, 8)}</p>
                      <h4 className="text-lg font-bold text-[#1a0505] leading-tight" style={{ fontFamily: "Inter Tight, sans-serif" }}>{order.packages?.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-[11px] font-medium text-[#3a1a1a]/50 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5"><Clock size={14}/> {order.booking_time || "Jadwal Admin"}</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 size={14}/> {order.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-none pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-[#3a1a1a]/40 uppercase font-bold tracking-widest mb-1">Total Bayar</p>
                      <p className="text-xl font-bold text-[#8B1A1A]">Rp {new Intl.NumberFormat("id-ID").format(order.total_price_idr)}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full border border-[#8B1A1A]/10 flex items-center justify-center text-[#8B1A1A] group-hover:bg-[#8B1A1A] group-hover:text-white transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}