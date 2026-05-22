'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Save, X, Printer, Clock, Users, Layers } from 'lucide-react';

// Interface disesuaikan dengan schema database (lowercase)
interface Package {
  id?: string;
  title: string;
  type: string;
  base_price_idr: number;
  min_people: number;
  max_people: number;
  extra_price_per_person: number;
  duration_minutes: number;
  print_4r: number;
  print_3x4: number;
  print_4x6: number;
  print_6r: number;
  default_background: string;
  soft_file: boolean;
  is_active: boolean;
  description?: string | null;
  includes?: string | null;
}

export default function MasterDataPackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [, setLoading] = useState(true);
  
  const initialFormState: Partial<Package> = {
    title: '',
    type: 'self_photo',
    base_price_idr: 0,
    min_people: 1,
    max_people: 5,
    extra_price_per_person: 0,
    duration_minutes: 15,
    print_4r: 0,
    print_3x4: 0,
    print_4x6: 0,
    print_6r: 0,
    default_background: 'putih',
    soft_file: false,
    is_active: true,
    description: null,
    includes: null,
  };

  const [formData, setFormData] = useState<Partial<Package>>(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchPackages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching:", error);
      alert("Gagal mengambil data: " + error.message);
    } else {
      setPackages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editId) {
        const { error } = await supabase.from('packages').update(formData).eq('id', editId);
        if (error) throw error;
        alert("Paket berhasil diperbarui!");
      } else {
        const { error } = await supabase.from('packages').insert([formData]);
        if (error) throw error;
        alert("Paket baru berhasil ditambahkan!");
      }
      resetForm();
      fetchPackages();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus paket ini?")) return;
    const { error } = await supabase.from('packages').delete().eq('id', id);
    if (error) alert("Gagal menghapus: " + error.message);
    else {
      alert("Paket berhasil dihapus!");
      fetchPackages();
    }
  };

  const handleEdit = (pkg: Package) => {
    setFormData(pkg);
    setIsEditing(true);
    setEditId(pkg.id || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Master Data Paket</h1>

      {/* FORM SECTION */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${isEditing ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
            {isEditing ? <Edit2 size={24}/> : <Plus size={24}/>}
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? 'Edit Konfigurasi Paket' : 'Buat Paket Baru'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Kolom 1: Dasar */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 font-semibold text-gray-700 border-b pb-2"><Layers size={18}/> Info Dasar</label>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Nama Paket</span>
                <input required type="text" value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="mt-1 block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Kategori</span>
                <select value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="mt-1 block w-full rounded-lg border-gray-300 border p-2.5"
                >
                  <option value="self_photo">Self Photo</option>
                  <option value="pas_foto">Pas Foto</option>
                  <option value="photographer">Photographer</option>
                </select>
              </div>
            </div>

            {/* Kolom 2: Harga & Kapasitas */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 font-semibold text-gray-700 border-b pb-2"><Users size={18}/> Harga & Kuota</label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Harga Base</span>
                  <input type="number" value={formData.base_price_idr}
                    onChange={(e) => setFormData({...formData, base_price_idr: Number(e.target.value)})}
                    className="mt-1 block w-full rounded-lg border-gray-300 border p-2.5"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Extra/Org</span>
                  <input type="number" value={formData.extra_price_per_person}
                    onChange={(e) => setFormData({...formData, extra_price_per_person: Number(e.target.value)})}
                    className="mt-1 block w-full rounded-lg border-gray-300 border p-2.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Min Org</span>
                  <input type="number" value={formData.min_people}
                    onChange={(e) => setFormData({...formData, min_people: Number(e.target.value)})}
                    className="mt-1 block w-full rounded-lg border-gray-300 border p-2.5"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Max Org</span>
                  <input type="number" value={formData.max_people}
                    onChange={(e) => setFormData({...formData, max_people: Number(e.target.value)})}
                    className="mt-1 block w-full rounded-lg border-gray-300 border p-2.5"
                  />
                </div>
              </div>
            </div>

            {/* Kolom 3: Teknis */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 font-semibold text-gray-700 border-b pb-2"><Clock size={18}/> Waktu & BG</label>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Durasi (Menit)</span>
                <input type="number" value={formData.duration_minutes}
                  onChange={(e) => setFormData({...formData, duration_minutes: Number(e.target.value)})}
                  className="mt-1 block w-full rounded-lg border-gray-300 border p-2.5"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Background Default</span>
                <input type="text" value={formData.default_background}
                  onChange={(e) => setFormData({...formData, default_background: e.target.value})}
                  className="mt-1 block w-full rounded-lg border-gray-300 border p-2.5"
                />
              </div>
            </div>
          </div>

          {/* Bagian Baru: Konfigurasi Print (Sesuai ALTER TABLE Lowercase) */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <label className="flex items-center gap-2 font-semibold text-gray-700 mb-4"><Printer size={18}/> Konfigurasi Cetak Foto</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Print 3x4', key: 'print_3x4' },
                { label: 'Print 4x6', key: 'print_4x6' },
                { label: 'Print 4R', key: 'print_4r' },
                { label: 'Print 6R', key: 'print_6r' }
              ].map((item) => (
                <div key={item.key}>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{item.label}</span>
                  <input 
                    type="number" 
                    value={formData[item.key as keyof Package] as number}
                    onChange={(e) => setFormData({...formData, [item.key]: Number(e.target.value)})}
                    className="mt-1 block w-full rounded-lg border-gray-300 border p-2 focus:ring-red-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 items-center border-t pt-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={formData.soft_file}
                onChange={(e) => setFormData({...formData, soft_file: e.target.checked})}
                className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Termasuk Soft File</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Paket Aktif (Tampil di Booking)</span>
            </label>
            <div className="ml-auto flex gap-3">
              {isEditing && (
                <button type="button" onClick={resetForm} className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-300 transition-all">
                  <X size={20} /> Batal
                </button>
              )}
              <button type="submit" className="px-8 py-2.5 bg-red-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 shadow-lg shadow-red-200 transition-all">
                <Save size={20} /> Simpan Data Paket
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Paket</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Harga (IDR)</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Kapasitas</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Cetak / Print</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-bold text-gray-900">{pkg.title}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-tighter">{pkg.type}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-bold text-gray-900">Rp{new Intl.NumberFormat("id-ID").format(pkg.base_price_idr)}</div>
                    <div className="text-[10px] text-red-500 font-medium">+{new Intl.NumberFormat("id-ID").format(pkg.extra_price_per_person)}/org extra</div>
                  </td>
                  <td className="px-6 py-5 text-gray-600 text-sm">
                    <div>{pkg.min_people}-{pkg.max_people} Orang</div>
                    <div className="text-xs text-gray-400">{pkg.duration_minutes} Menit</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="grid grid-cols-2 gap-1 max-w-[150px]">
                      {pkg.print_3x4 > 0 && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">3x4: {pkg.print_3x4}</span>}
                      {pkg.print_4x6 > 0 && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">4x6: {pkg.print_4x6}</span>}
                      {pkg.print_4r > 0 && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">4R: {pkg.print_4r}</span>}
                      {pkg.print_6r > 0 && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">6R: {pkg.print_6r}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {pkg.is_active ? 'Aktif' : 'Off'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(pkg)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(pkg.id!)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}