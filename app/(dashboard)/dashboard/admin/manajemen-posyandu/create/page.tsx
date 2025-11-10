'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ButtonSimpan from '@/components/button-simpan';
import ButtonBatal from '@/components/button-batal';
import dynamic from 'next/dynamic';

const ModalAmbilKoordinat = dynamic(() => import('@/components/modal-ambil-koordinat'), {
  ssr: false,
});

const enumOptions = [
  'PARIPURNA',
  'PRATAMA',
  'MADYA',
  'PURNAMA',
  'MANDIRI',
  'BELUM_AKREDITASI',
];

type Kelurahan = {
  id: number;
  nama: string;
};

export default function Page() {
  const router = useRouter();
  const namaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (namaRef.current) {
      namaRef.current.focus();
    }
  }, []);

  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    wilayah: '',
    kelurahanId: '',
    penanggungJawab: '',
    noHp: '',
    akreditasi: '',
    longitude: '',
    latitude: '',
  });

  const [kelurahanList, setKelurahanList] = useState<Kelurahan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  // State untuk cek realtime nama
  const [namaError, setNamaError] = useState<string | null>(null);
  const [checkingNama, setCheckingNama] = useState(false);

  // Fetch data kelurahan
  useEffect(() => {
    const fetchKelurahan = async () => {
      try {
        const res = await fetch('/api/wilayah-kerja');
        if (!res.ok) throw new Error('Gagal ambil kelurahan');
        const data = await res.json();
        setKelurahanList(data);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat data kelurahan!');
      }
    };

    fetchKelurahan();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const controller = new AbortController();
    const delayDebounce = setTimeout(async () => {
      if (formData.nama.trim() === '') {
        setNamaError(null);
        return;
      }

      setCheckingNama(true);
      try {
        const res = await fetch(`/api/check-namaposyandu?nama=${encodeURIComponent(formData.nama)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Gagal memeriksa nama');
        const data = await res.json();
        if (data.exists) {
          setNamaError('Nama Posyandu sudah terdaftar.');
        } else {
          setNamaError(null);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error(err);
      } finally {
        setCheckingNama(false);
      }
    }, 500); // debounce 0.5 detik

    return () => {
      clearTimeout(delayDebounce);
      controller.abort();
    };
  }, [formData.nama]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEmpty = Object.values(formData).some((value) => value === '');
    if (isEmpty) {
      toast.error('Semua field wajib diisi!');
      return;
    }

    const longitude = parseFloat(formData.longitude);
    const latitude = parseFloat(formData.latitude);

    if (isNaN(longitude) || isNaN(latitude)) {
      toast.error('Longitude dan Latitude harus berupa angka.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/posyandu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          longitude,
          latitude,
        }),
      });

      // Cek jika nama sudah ada (status 409)
      if (res.status === 409) {
        const data = await res.json();
        toast.error(data.message || 'Nama Posyandu sudah terdaftar!');
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error('Gagal menyimpan data');

      toast.success('Berhasil menambahkan data Posyandu!');
      router.push('/dashboard/admin/manajemen-posyandu/data-posyandu');
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="px-3 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="p-6 border bg-white shadow-md rounded-xl">
          <h1 className="text-2xl font-bold mb-8">
            Tambah <span className="">Data Posyandu</span>
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-8">
              {/* --- Nama Posyandu (dengan validasi realtime) --- */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nama Posyandu
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    placeholder="Contoh: Posyandu Melati"
                    ref={namaRef}
                    className={`w-full px-4 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition
                      ${namaError
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-green-400'}
                    `}
                  />
                  {checkingNama && (
                    <span className="absolute right-3 top-2.5 text-gray-400 text-sm animate-pulse">
                      Mengecek...
                    </span>
                  )}
                </div>
                {namaError && (
                  <p className="text-red-500 text-sm mt-1">{namaError}</p>
                )}
              </div>

              {/* --- Alamat & Wilayah --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat</label>
                  <input
                    type="text"
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    placeholder="Contoh: Jl. Mawar No. 10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Wilayah</label>
                  <input
                    type="text"
                    name="wilayah"
                    value={formData.wilayah}
                    onChange={handleChange}
                    placeholder="Contoh: RW 01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                  />
                </div>
              </div>

              {/* --- Penanggung Jawab & No HP --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Penanggung Jawab</label>
                  <input
                    type="text"
                    name="penanggungJawab"
                    value={formData.penanggungJawab}
                    onChange={handleChange}
                    placeholder="Contoh: Aisyah"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">No. HP</label>
                  <input
                    type="tel"
                    name="noHp"
                    value={formData.noHp}
                    onChange={handleChange}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                  />
                </div>
              </div>

              {/* --- Koordinat Lokasi --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="Contoh: 107.619123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className="mt-2 text-sm text-green-600 font-medium hover:underline"
                  >
                    📍 Ambil dari Peta
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="Contoh: -6.903449"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                  />
                </div>
              </div>

              {/* --- Kelurahan & Akreditasi --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kelurahan</label>
                  <select
                    name="kelurahanId"
                    value={formData.kelurahanId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                  >
                    <option value="">-- Pilih Kelurahan --</option>
                    {kelurahanList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Akreditasi</label>
                  <select
                    name="akreditasi"
                    value={formData.akreditasi}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                  >
                    <option value="">-- Pilih Akreditasi --</option>
                    {enumOptions.map((value) => (
                      <option key={value} value={value}>
                        {value.replace(/([A-Z])/g, ' $1').trim()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* --- Tombol Aksi --- */}
              <div className="flex justify-end gap-3 pt-8">
                <ButtonBatal onClick={() => router.back()} />
                <ButtonSimpan loading={loading} />
              </div>
            </div>
          </form>

          {/* Modal Ambil Koordinat */}
          {showMap && (
            <ModalAmbilKoordinat
              onPick={(lat, lng) => {
                setFormData({
                  ...formData,
                  latitude: lat.toString(),
                  longitude: lng.toString(),
                });
                setShowMap(false);
              }}
              onClose={() => setShowMap(false)}
            />
          )}

        </div>
      </div>
    </div>
  );
}
