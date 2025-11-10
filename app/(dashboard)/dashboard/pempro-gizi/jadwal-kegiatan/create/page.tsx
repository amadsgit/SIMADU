'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ButtonSimpan from '@/components/button-simpan';
import ButtonBatal from '@/components/button-batal';

type Posyandu = {
  kelurahan: any;
  id: number;
  nama: string;
  wilayah: string;
};

export default function TambahKegiatanPage() {
  const router = useRouter();
  const namaRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    tanggalPelaksanaan: '',
    alamat: '',
    wilayah: '',
    posyanduId: '',
  });

  const [posyanduList, setPosyanduList] = useState<Posyandu[]>([]);
  const [loading, setLoading] = useState(false);

  // Fokus otomatis ke nama kegiatan
  useEffect(() => {
    namaRef.current?.focus();
  }, []);

  // Ambil daftar posyandu untuk pilihan
  useEffect(() => {
    const fetchPosyandu = async () => {
      try {
        const res = await fetch('/api/posyandu');
        if (!res.ok) throw new Error('Gagal memuat data posyandu');
        const data = await res.json();
        setPosyanduList(data);
      } catch (error) {
        console.error(error);
        toast.error('Gagal memuat data posyandu!');
      }
    };
    fetchPosyandu();
  }, []);

  // Handle input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { nama, deskripsi, tanggalPelaksanaan, alamat, posyanduId } = formData;
    if (!nama || !tanggalPelaksanaan || !alamat || !posyanduId) {
      toast.error('Semua field wajib diisi!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/pemproGiziJadwal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan kegiatan');

      toast.success('Kegiatan berhasil ditambahkan!');
      router.push('/dashboard/pempro-gizi/jadwal-kegiatan');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Terjadi kesalahan saat menyimpan data!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-3 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="p-6 border bg-white shadow-md rounded-xl">
          <h1 className="text-2xl font-bold mb-8">
            Tambah <span className="text-emerald-700">Kegiatan Program Gizi</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* --- Nama Kegiatan --- */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nama Kegiatan
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Contoh: Pemberian Makanan Tambahan bagi balita"
                ref={namaRef}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none transition"
              />
            </div>

            {/* --- Deskripsi --- */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                rows={3}
                placeholder="Contoh: Pemberian Makanan Tambahan bagi balita usia 1–5 tahun"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none transition"
              ></textarea>
            </div>

            {/* --- Tanggal Pelaksanaan --- */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tanggal Pelaksanaan
              </label>
              <input
                type="date"
                name="tanggalPelaksanaan"
                value={formData.tanggalPelaksanaan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none transition"
              />
            </div>

            {/* --- Alamat --- */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Lokasi / Alamat
              </label>
              <input
                type="text"
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                placeholder="Contoh: Jl.Pulau banda"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none transition"
              />
            </div>

            {/* --- Pilih Posyandu --- */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Posyandu
              </label>
              <select
                name="posyanduId"
                value={formData.posyanduId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm bg-white focus:ring-2 focus:ring-emerald-400 outline-none transition"
              >
                <option value="">-- Pilih Posyandu --</option>
                {posyanduList.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.nama}, {pos.wilayah} Kel.{pos.kelurahan.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* --- Tombol --- */}
            <div className="flex justify-end gap-3 pt-8">
              <ButtonBatal onClick={() => router.back()} />
              <ButtonSimpan loading={loading} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
