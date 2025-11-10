'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ButtonSimpan from '@/components/button-simpan';
import ButtonBatal from '@/components/button-batal';

type Klaster = {
  id: number;
  nama: string;
};

export default function Page() {
  const router = useRouter();
  const namaRef = useRef<HTMLInputElement>(null);

  const [klasterList, setKlasterList] = useState<Klaster[]>([]);
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    klasterId: '',
  });

  const [loading, setLoading] = useState(false);

  // Fokus otomatis di nama
  useEffect(() => {
    if (namaRef.current) namaRef.current.focus();
  }, []);

  // Fetch klaster untuk dropdown
  useEffect(() => {
    const fetchKlasters = async () => {
      try {
        const res = await fetch('/api/klaster');
        if (!res.ok) throw new Error('Gagal memuat daftar klaster');
        const data = await res.json();
        setKlasterList(data);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat daftar klaster!');
      }
    };

    fetchKlasters();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama) {
      toast.error('Nama program kesehatan wajib diisi!');
      return;
    }

    if (!formData.klasterId) {
      toast.error('Pilih klaster terlebih dahulu!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/prokes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: formData.nama,
          deskripsi: formData.deskripsi,
          klasterId: parseInt(formData.klasterId, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan program kesehatan');

      toast.success(data.message || 'Program kesehatan berhasil ditambahkan!');
      router.push('/dashboard/admin/manajemen-program/prokes');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Terjadi kesalahan saat menyimpan program kesehatan!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-3 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="p-6 border bg-white shadow-md rounded-xl">
          <h1 className="text-2xl font-bold mb-8">
            Tambah <span className="text-emerald-700">Program Kesehatan Baru</span>
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              {/* Nama Program */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nama Program Kesehatan
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Contoh: Program Imunisasi"
                  ref={namaRef}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none transition"
                  required
                />
              </div>

              {/* Pilih Klaster */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Pilih Klaster
                </label>
                <select
                  name="klasterId"
                  value={formData.klasterId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none transition"
                  required
                >
                  <option value="">-- Pilih Klaster --</option>
                  {klasterList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deskripsi Program */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  placeholder="Deskripsi singkat program (opsional)"
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
