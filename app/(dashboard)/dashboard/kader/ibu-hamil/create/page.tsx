'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ButtonSimpan from '@/components/button-simpan';
import ButtonBatal from '@/components/button-batal';

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

export default function Page() {
  const router = useRouter();
  const namaRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    noKK: '',
    tanggalLahir: '',
    umurKehamilanAwal: '',
    tanggalHPHT: '',
    tanggalHPL: '',
    gravida: '',
    para: '',
    abortus: '',
    alamat: '',
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

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validasi NIK realtime
    if (name === 'nik') {
      if (value.length < 16) return setNikError('NIK harus 16 digit');
      try {
        const res = await fetch(`/api/check-email-nik?nik=${encodeURIComponent(value)}`);
        const data = await res.json();
        setNikError(data.exists ? 'NIK sudah terdaftar' : null);
      } catch {
        setNikError('Gagal memeriksa NIK');
      }
    }

    // Kalkulasi otomatis HPL & usia kehamilan dari HPHT
    if (name === 'tanggalHPHT' && value) {
      const hpht = new Date(value);
      const hpl = new Date(hpht);
      hpl.setDate(hpht.getDate() + 7);
      hpl.setMonth(hpht.getMonth() + 9);

      const now = new Date();
      const diffMs = now.getTime() - hpht.getTime();
      const weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));

      setFormData((prev) => ({
        ...prev,
        tanggalHPHT: value,
        tanggalHPL: hpl.toISOString().split('T')[0], // format yyyy-mm-dd
        umurKehamilanAwal: weeks > 0 ? String(weeks) : '0',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const required = ['nama', 'nik', 'noKK', 'tanggalLahir', 'alamat'];
    if (required.some((f) => !formData[f as keyof typeof formData]))
      return toast.error('Field wajib harus diisi!');
    if (nikError) return toast.error('Perbaiki kesalahan input NIK');

    setLoading(true);
    try {
      const res = await fetch('/api/kader/ibuHamil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan data');

      toast.success(data.message || 'Data ibu hamil berhasil ditambahkan');
      router.push('/dashboard/kader/ibu-hamil');
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
            Tambah <span className="text-pink-600">Ibu Hamil</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block text-sm font-semibold mb-1">Nama Ibu Hamil</label>
                <input
                  type="text"
                  name="nama"
                  ref={namaRef}
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Nama lengkap ibu hamil"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

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

              <div>
                <label className="block text-sm font-semibold mb-1">Tanggal HPHT</label>
                <input
                  type="date"
                  name="tanggalHPHT"
                  value={formData.tanggalHPHT}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Umur Kehamilan Awal (minggu)</label>
                <input
                  type="number"
                  name="umurKehamilanAwal"
                  value={formData.umurKehamilanAwal}
                  readOnly
                  placeholder="Otomatis dihitung dari HPHT"
                  className="w-full px-4 py-2 border rounded-xl bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Tanggal HPL</label>
                <input
                  type="date"
                  name="tanggalHPL"
                  value={formData.tanggalHPL}
                  readOnly
                  placeholder="Otomatis dihitung dari HPHT"
                  className="w-full px-4 py-2 border rounded-xl bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Gravida (Jumlah Kehamilan)</label>
                <input
                  type="number"
                  name="gravida"
                  value={formData.gravida}
                  onChange={handleChange}
                  placeholder="Contoh: 2"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Para (Jumlah Kelahiran)</label>
                <input
                  type="number"
                  name="para"
                  value={formData.para}
                  onChange={handleChange}
                  placeholder="Contoh: 1"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Abortus (Keguguran)</label>
                <input
                  type="number"
                  name="abortus"
                  value={formData.abortus}
                  onChange={handleChange}
                  placeholder="Contoh: 0"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1">Alamat</label>
                <input
                  type="text"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  placeholder="Alamat lengkap tempat tinggal"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* Posyandu & Kader (read-only) */}
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
              <ButtonSimpan loading={loading} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
