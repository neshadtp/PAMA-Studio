"use client";

import React from "react";
import { CheckCircle2, MessageCircle, X, Calendar, Clock, Receipt, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuccessModal({ isOpen, data, onClose }: any) {
  const router = useRouter();
  
  // Jangan render jika modal tidak terbuka atau data belum siap
  if (!isOpen || !data) return null;

  const handleWhatsApp = () => {
    const adminPhone = "6282331555431";
    // Pesan otomatis yang mencakup rincian dari database
    const message = `Halo PAMA Studio! Saya baru saja melakukan booking:
    
*Order ID:* #${data.id.slice(0, 8)}
*Nama:* ${data.userName}
*Email:* ${data.userEmail}
*Paket:* ${data.packageName}
*Jadwal:* ${data.date} (${data.time})
*Total:* Rp ${new Intl.NumberFormat("id-ID").format(data.totalPrice)}

Mohon konfirmasinya ya!`;

    window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleClose = () => {
    // Jalankan fungsi onClose dari parent (CheckoutPage) untuk mereset state
    onClose();
    // Langsung arahkan ke dashboard client untuk pelacakan pesanan
    router.push("/dashboard-client"); 
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-[#FBF7F1] shadow-2xl">
        
        {/* Tombol X untuk menutup dan ke Dashboard */}
        <button 
          onClick={handleClose} 
          className="absolute right-6 top-6 text-gray-400 hover:text-[#8B1A1A] transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header Maroon Estetik */}
        <div className="bg-[#8B1A1A] p-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-serif" style={{ fontFamily: "var(--font-fraunces)" }}>
            Booking Berhasil!
          </h2>
          <p className="text-sm opacity-80" style={{ fontFamily: "var(--font-inter-tight)" }}>
            Pesanan Anda telah tercatat
          </p>
        </div>

        <div className="p-8 space-y-6" style={{ fontFamily: "var(--font-inter-tight)" }}>
          {/* Detail Pelanggan & Jadwal */}
          <div className="space-y-3 text-sm text-[#3a1a1a]/70">
             <div className="flex items-center gap-3">
                <User size={16} className="text-[#8B1A1A]"/> 
                <span className="font-medium text-[#1a0505]">{data.userName}</span>
             </div>
             <div className="flex items-center gap-3">
                <Calendar size={16} className="text-[#8B1A1A]"/> 
                <span className="font-medium text-[#1a0505]">{data.date}</span>
             </div>
             <div className="flex items-center gap-3">
                <Clock size={16} className="text-[#8B1A1A]"/> 
                <span className="font-medium text-[#1a0505]">{data.time}</span>
             </div>
          </div>

          {/* Rincian Biaya (Struk) */}
          <div className="rounded-2xl border border-[#8B1A1A]/10 bg-white p-5 font-medium text-[#1a0505]">
            <div className="flex items-center gap-2 mb-3 text-[#8B1A1A]">
              <Receipt size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Rincian Pembayaran</span>
            </div>
            
            <div className="flex justify-between text-sm mb-2">
              <span className="opacity-60">{data.packageName}</span>
              <span>Rp {new Intl.NumberFormat("id-ID").format(data.totalPrice)}</span>
            </div>
            
            <div className="pt-3 mt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
              <span className="font-bold">Total</span>
              <span className="text-lg font-bold text-[#8B1A1A]">
                Rp {new Intl.NumberFormat("id-ID").format(data.totalPrice)}
              </span>
            </div>
          </div>

          {/* Tombol WhatsApp API */}
          <button 
            onClick={handleWhatsApp} 
            className="flex w-full items-center justify-center gap-3 rounded-full bg-[#25D366] py-4 text-white font-bold shadow-lg transition hover:scale-[1.02] active:scale-95"
          >
            <MessageCircle size={20} /> Konfirmasi ke WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}