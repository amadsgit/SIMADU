'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ButtonSimpan from '@/components/button-simpan';
import ButtonBatal from '@/components/button-batal';

export default function Page() {
  const router = useRouter();
  const namaRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
  });

  const [loading, setLoading] = useState(false);

  // Fokus otomatis di nama
  useEffect(() => {
    if (namaRef.current) namaRef.current.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama) {
      toast.error('Nama klaster wajib diisi!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/klaster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan klaster');

      toast.success(data.message || 'Klaster berhasil ditambahkan!');
      router.push('/dashboard/admin/manajemen-program/klaster');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Terjadi kesalahan saat menyimpan klaster!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-3 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="p-6 border bg-white shadow-md rounded-xl">
          <h1 className="text-2xl font-bold mb-8">
            Tambah <span className="text-emerald-700">Klaster Baru</span>
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              {/* Nama Klaster */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nama Klaster
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Contoh: Klaster 1"
                  ref={namaRef}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none transition"
                  required
                />
              </div>

              {/* Deskripsi Klaster */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  placeholder="Deskripsi singkat klaster (opsional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none transition"
                  rows={4}
                />
              </div>

              {/* Tombol */}
              <div className="flex justify-end gap-3 pt-4">
                <ButtonBatal onClick={() => router.back()} />
                <ButtonSimpan loading={loading} />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
