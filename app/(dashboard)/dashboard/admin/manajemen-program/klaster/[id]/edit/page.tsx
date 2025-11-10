'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import ButtonUpdate from '@/components/button-update';
import ButtonBatal from '@/components/button-batal';

export default function Page() {
  const router = useRouter();
  const params = useParams(); // Ambil id dari route
  const klasterId = params?.id;

  const namaRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
  });

  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fokus otomatis di nama
  useEffect(() => {
    if (namaRef.current) namaRef.current.focus();
  }, []);

  // Ambil data klaster saat pertama load
  useEffect(() => {
    if (!klasterId) return;

    const fetchKlaster = async () => {
      try {
        const res = await fetch(`/api/klaster/${klasterId}`);
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Gagal mengambil data klaster');
          router.back();
          return;
        }

        setFormData({
          nama: data.nama || '',
          deskripsi: data.deskripsi || '',
        });
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Terjadi kesalahan saat memuat data klaster!');
        router.back();
      } finally {
        setIsFetching(false);
      }
    };

    fetchKlaster();
  }, [klasterId, router]);

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

    if (!klasterId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/klaster/${klasterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui klaster');

      toast.success(data.message || 'Klaster berhasil diperbarui!');
      router.push('/dashboard/admin/manajemen-program/klaster');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Terjadi kesalahan saat menyimpan klaster!');
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center py-16 text-emerald-600">
        <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <span className="text-sm font-medium">Memuat data klaster...</span>
      </div>
    );
  }

  return (
    <div className="px-3 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="p-6 border bg-white shadow-md rounded-xl">
          <h1 className="text-2xl font-bold mb-8">
            Edit <span className="text-emerald-700">Klaster</span>
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
                <ButtonUpdate loading={loading} />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
