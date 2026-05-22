"use client";

import React, { useState } from "react";
import { Plus, Eye, Edit, X } from "lucide-react";
import { useRouter } from "next/navigation";
import ModalPortal from "@/components/ui/ModalPortal";

type Page = {
  id: string;
  title: string;
  description: string;
  path: string;
};

const PAGES: Page[] = [
  {
    id: "beranda",
    title: "Beranda",
    description: "Halaman utama website PAMA Studio yang menampilkan informasi studio, layanan, dan akses booking.",
    path: "/",
  },
  {
    id: "portofolio",
    title: "Portofolio",
    description: "Halaman portofolio yang menampilkan hasil foto dan dokumentasi dari PAMA Studio.",
    path: "/#portofolio",
  },
  {
    id: "paket",
    title: "Paket",
    description: "Halaman yang menampilkan semua paket foto favorit para pelanggan PAMA Studio.",
    path: "/paket",
  },
  {
    id: "testimoni",
    title: "Testimoni",
    description: "Halaman yang menampilkan pengalaman dan ulasan pelanggan PAMA Studio.",
    path: "/#testimoni",
  },
  {
    id: "kontak",
    title: "Kontak",
    description: "Halaman yang menampilkan alamat studio, jam operasional, dan informasi kontak.",
    path: "/#kontak",
  },
  {
    id: "footer",
    title: "Footer",
    description: "Halaman footer yang menampilkan informasi kontak dan tautan penting.",
    path: "/#footer",
  },
  {
    id: "checkout",
    title: "Checkout",
    description: "Halaman pemesanan untuk melakukan booking paket foto di PAMA Studio.",
    path: "/checkout",
  },
  {
    id: "dashboard-client",
    title: "Dashboard Client",
    description: "Halaman dashboard untuk pelanggan melihat riwayat dan status pesanan mereka.",
    path: "/dashboard-client",
  },
];

function PagePreviewFrame({ path }: { path: string }) {
  return (
    <div className="relative w-full bg-gray-100 rounded-t-2xl overflow-hidden" style={{ height: 200 }}>
      {/* Browser chrome */}
      <div className="absolute top-0 left-0 right-0 z-10 h-7 bg-white border-b border-gray-200 flex items-center px-3 gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <div className="flex-1 mx-2 h-4 bg-gray-100 rounded-full flex items-center px-2">
          <span className="text-[9px] text-gray-400 truncate">pamastudio.com{path}</span>
        </div>
      </div>

      {/* iframe preview */}
      <div className="absolute inset-0 top-7">
        <iframe
          src={path}
          title={`preview-${path}`}
          style={{
            width: "200%",
            height: "200%",
            transform: "scale(0.5)",
            transformOrigin: "top left",
            border: "none",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

function AddPageModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ title: "", description: "", path: "" });

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">Tambah Halaman Baru</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Judul Halaman</label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20"
              placeholder="Contoh: Blog"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Path URL</label>
            <input
              value={form.path}
              onChange={e => setForm({ ...form, path: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20"
              placeholder="Contoh: /blog"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 resize-none"
              rows={3}
              placeholder="Deskripsi singkat halaman ini..."
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
            Batal
          </button>
          <button className="flex-1 py-2.5 rounded-xl bg-[#8B1A1A] text-white text-sm font-semibold hover:bg-[#6B1212] transition">
            Simpan
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}

function EditPageModal({ page, onClose }: { page: Page; onClose: () => void }) {
  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Edit Halaman</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Untuk mengedit konten halaman <b>{page.title}</b>, buka file komponen berikut di VS Code:
        </p>
        <div className="bg-gray-50 rounded-xl px-4 py-3 font-mono text-xs text-gray-600 mb-6">
          src/app{page.path === "/" ? "" : page.path.replace("#", "")}/page.tsx
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#8B1A1A] text-white text-sm font-semibold hover:bg-[#6B1212] transition"
        >
          Tutup
        </button>
      </div>
    </div>
    </ModalPortal>
  );
}

export default function PageManagementPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const router = useRouter();

  return (
    <div className="space-y-6">
      {showAddModal && <AddPageModal onClose={() => setShowAddModal(false)} />}
      {editingPage && <EditPageModal page={editingPage} onClose={() => setEditingPage(null)} />}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#8B1A1A] text-xs font-bold uppercase tracking-widest">Content Repository</p>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">Page Management</h1>
        </div>
<button
  onClick={() => router.push("/admin/pagemanagement/addnewpage")}
  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B1A1A] text-white text-sm font-bold hover:bg-[#6B1212] transition shadow-sm"
>
  <Plus size={16} /> Add New Page
</button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PAGES.map(page => (
          <div key={page.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <PagePreviewFrame path={page.path} />
            <div className="p-5">
              <h3 className="font-bold text-gray-800 text-base mb-1">{page.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{page.description}</p>
              <div className="flex gap-3">
                <a
                  href={page.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  <Eye size={15} /> Preview
                </a>
                <button
                onClick={() => router.push(`/admin/pagemanagement/editpage?id=${page.id}&title=${encodeURIComponent(page.title)}&description=${encodeURIComponent(page.description)}`)}                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#8B1A1A] text-white text-sm font-semibold hover:bg-[#6B1212] transition"
              >
                <Edit size={15} /> Edit Page
              </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}