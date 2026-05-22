"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, ArrowLeft, Upload, X } from "lucide-react";

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-14 h-7 rounded-full transition-colors ${value ? "bg-[#8B1A1A]" : "bg-gray-200"}`}
    >
      <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${value ? "left-8" : "left-1"}`} />
    </button>
  );
}

export default function AddNewPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "" });
  const [image, setImage] = useState<string | null>(null);
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.title) {
      alert("Nama konten wajib diisi");
      return;
    }
    setSaving(true);
    // Simulasi save
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    router.push("/admin/pagemanagement");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#8B1A1A] text-xs font-bold uppercase tracking-widest">Update Repository Content</p>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">Add New Page Details</h1>
        </div>
        <button
          onClick={() => router.push("/admin/pagemanagement")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        {/* Nama Konten */}
        <div>
          <label className="text-xs font-bold text-gray-800 uppercase tracking-widest block mb-2">Nama Konten</label>
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Contoh: Portofolio"
            className="w-full bg-[#FBF7F1] border-0 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20"
          />
        </div>

        {/* Deskripsi */}
        <div>
          <label className="text-xs font-bold text-gray-800 uppercase tracking-widest block mb-2">Deskripsi</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Deskripsi halaman ini..."
            rows={4}
            className="w-full bg-[#FBF7F1] border-0 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 resize-none"
          />
        </div>

        {/* Gambar */}
        <div>
          <label className="text-xs font-bold text-gray-800 uppercase tracking-widest block mb-2">Gambar</label>
          {image ? (
            <div className="relative">
              <Image
                src={image}
                alt="preview"
                width={1200}
                height={800}
                className="w-full rounded-xl object-cover"
                style={{ maxHeight: 240 }}
              />
              <button
                onClick={() => setImage(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50 transition"
              >
                <X size={16} className="text-red-500" />
              </button>
              <p className="text-xs text-gray-400 mt-2 text-center">Rekomendasi: 461px dan 287px (MAX 5MB) File WEBP</p>
              <button
                onClick={() => setImage(null)}
                className="mt-3 w-full py-2.5 rounded-xl bg-[#8B1A1A] text-white text-sm font-semibold hover:bg-[#6B1212] transition"
              >
                Hapus Gambar
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-40 bg-[#FBF7F1] rounded-xl border-2 border-dashed border-[#8B1A1A]/20 cursor-pointer hover:bg-[#8B1A1A]/5 transition">
              <Upload size={24} className="text-[#8B1A1A]/40 mb-2" />
              <span className="text-sm text-gray-400">Klik untuk upload gambar</span>
              <span className="text-xs text-gray-300 mt-1">WEBP, PNG, JPG (MAX 5MB)</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>

        {/* Status Halaman */}
        <div className="flex items-center gap-4 p-4 bg-[#FBF7F1] rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <Eye size={20} className="text-[#8B1A1A]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-800">Status Halaman</p>
            <p className="text-xs text-gray-400">Publikasikan halaman ini ke publik</p>
          </div>
          <Toggle value={published} onChange={setPublished} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => router.push("/admin/pagemanagement")}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          Batal
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 rounded-xl bg-[#8B1A1A] text-white text-sm font-semibold hover:bg-[#6B1212] transition disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan Halaman"}
        </button>
      </div>
    </div>
  );
}