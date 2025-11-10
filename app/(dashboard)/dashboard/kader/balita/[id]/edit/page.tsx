'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import ButtonBatal from '@/components/button-batal';
import ButtonUpdate from '@/components/button-update';

type SessionKader = {
  id: number;
  nama: string;
  posyandu: {
    id: number;
    nama: string;
    wilayah: string;
    alamat: string;
    kelurahan: { id: number; nama: string };
  };
};

export default function EditBalitaPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const namaRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    noKK: '',
    tanggalLahir: '',
    jenisKelamin: '',
    namaAyah: '',
    namaIbu: '',
    alamat: '',
    beratLahir: '',
    panjangLahir: '',
  });

  const [sessionKader, setSessionKader] = useState<SessionKader | null>(null);
  const [loading, setLoading] = useState(false);
  const [nikError, setNikError] = useState<string | null>(null);

  useEffect(() => {
    namaRef.current?.focus();
  }, []);

  // Ambil data kader login
  useEffect(() => {
    const fetchSessionKader = async () => {
      try {
        const res = await fetch('/api/kader/balita/sessionKader');
        if (!res.ok) throw new Error('Gagal memuat data kader');
        const data = await res.json();
        setSessionKader(data);
      } catch (error) {
        console.error('Gagal mengambil data kader:', error);
        toast.error('Gagal memuat data kader login!');
      }
    };
    fetchSessionKader();
  }, []);

  // Ambil data balita berdasarkan ID
  useEffect(() => {
    if (!id) return;
    const fetchBalita = async () => {
      try {
        const res = await fetch(`/api/kader/balita/${id}`);
        if (!res.ok) throw new Error('Data balita tidak ditemukan');
        const data = await res.json();

        setFormData({
          nama: data.nama || '',
          nik: data.nik || '',
          noKK: data.noKK || '',
          tanggalLahir: data.tanggalLahir ? data.tanggalLahir.split('T')[0] : '',
          jenisKelamin: data.jenisKelamin || '',
          namaAyah: data.namaAyah || '',
          namaIbu: data.namaIbu || '',
          alamat: data.alamat || '',
          beratLahir: data.beratLahir?.toString() || '',
          panjangLahir: data.panjangLahir?.toString() || '',
        });
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat data balita');
        router.push('/dashboard/kader/balita');
      }
    };
    fetchBalita();
  }, [id, router]);

  // Handle perubahan input
  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validasi NIK realtime
    if (name === 'nik') {
      if (value.length < 16) return setNikError('NIK harus 16 digit');
      try {
        const res = await fetch(`/api/check-email-nik?nik=${encodeURIComponent(value)}`);
        const data = await res.json();
        // Cek duplikat NIK kecuali milik sendiri
        if (data.exists && data.nik !== formData.nik) {
          setNikError('NIK sudah terdaftar');
        } else {
          setNikError(null);
        }
      } catch {
        setNikError('Gagal memeriksa NIK');
      }
    }
  };

  // Submit update balita
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = ['nama', 'noKK', 'tanggalLahir', 'jenisKelamin', 'alamat'];
    if (required.some((f) => !formData[f as keyof typeof formData]))
      return toast.error('Field wajib harus diisi!');
    if (nikError) return toast.error('Perbaiki kesalahan input NIK');

    setLoading(true);
    try {
      const res = await fetch(`/api/kader/balita/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui data balita');

      toast.success(data.message || 'Data balita berhasil diperbarui');
      router.push('/dashboard/kader/balita');
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-3 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="p-6 border bg-white shadow-md rounded-xl">
          <h1 className="text-2xl font-bold mb-8">
            Edit <span className="text-emerald-700">Balita</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama */}
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Balita</label>
                <input
                  type="text"
                  name="nama"
                  ref={namaRef}
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Nama lengkap balita"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* NIK */}
              <div>
                <label className="block text-sm font-semibold mb-1">NIK</label>
                <input
                  type="text"
                  name="nik"
                  value={formData.nik}
                  onChange={handleChange}
                  maxLength={16}
                  placeholder="16 digit NIK"
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 outline-none transition ${
                    nikError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-emerald-400'
                  }`}
                />
                {nikError && <p className="text-xs text-red-500 mt-1">{nikError}</p>}
              </div>

              {/* No KK */}
              <div>
                <label className="block text-sm font-semibold mb-1">No KK</label>
                <input
                  type="text"
                  name="noKK"
                  maxLength={16}
                  value={formData.noKK}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-sm font-semibold mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  name="tanggalLahir"
                  value={formData.tanggalLahir}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-sm font-semibold mb-1">Jenis Kelamin</label>
                <select
                  name="jenisKelamin"
                  value={formData.jenisKelamin}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                >
                  <option value="">-- Pilih Jenis Kelamin --</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-sm font-semibold mb-1">Alamat</label>
                <input
                  type="text"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  placeholder="Alamat lengkap"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* Nama Ayah */}
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Ayah</label>
                <input
                  type="text"
                  name="namaAyah"
                  value={formData.namaAyah}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* Nama Ibu */}
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Ibu</label>
                <input
                  type="text"
                  name="namaIbu"
                  value={formData.namaIbu}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* Berat & Panjang */}
              <div>
                <label className="block text-sm font-semibold mb-1">Berat Lahir (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  name="beratLahir"
                  value={formData.beratLahir}
                  onChange={handleChange}
                  placeholder="contoh: 3.25"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Panjang Lahir (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  name="panjangLahir"
                  value={formData.panjangLahir}
                  onChange={handleChange}
                  placeholder="contoh: 49.5"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* Posyandu & Kader */}
              <div>
                <label className="block text-sm font-semibold mb-1">Posyandu</label>
                <input
                  type="text"
                  value={
                    sessionKader
                      ? `${sessionKader.posyandu.nama} (${sessionKader.posyandu.wilayah})`
                      : 'Memuat...'
                  }
                  readOnly
                  className="w-full px-4 py-2 border rounded-xl bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Kader</label>
                <input
                  type="text"
                  value={sessionKader?.nama || 'Memuat...'}
                  readOnly
                  className="w-full px-4 py-2 border rounded-xl bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <ButtonBatal onClick={() => router.back()} />
              <ButtonUpdate loading={loading} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
