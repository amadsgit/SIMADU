'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

type Kegiatan = {
  id: number;
  nama: string;
  deskripsi: string | null;
  tanggalPelaksanaan: string;
  alamat: string;
  posyandu: {
    nama: string;
    wilayah: string;
    kelurahan: { nama: string };
  };
  programKesehatan: {
    nama: string;
  };
};

export default function JadwalKegiatanKaderPage() {
  const [upcomingList, setUpcomingList] = useState<Kegiatan[]>([]);
  const [filteredList, setFilteredList] = useState<Kegiatan[]>([]);
  const [selectedProgram, setSelectedProgram] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [posyanduNama, setPosyanduNama] = useState<string>('');
  const [posyanduWilayah, setPosyanduWilayah] = useState<string>('');
  const [kelurahanNama, setkelurahanNama] = useState<string>('');

  // Helper tanggal lokal
  const normalizeDate = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  useEffect(() => {
    const fetchKegiatan = async () => {
      try {
        const res = await fetch('/api/kader/kegiatan');
        if (!res.ok) throw new Error('Gagal mengambil data kegiatan');

        const data: Kegiatan[] = await res.json();

        // Sort terbaru dulu
        data.sort(
          (a, b) =>
            new Date(b.tanggalPelaksanaan).getTime() -
            new Date(a.tanggalPelaksanaan).getTime()
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = data.filter((k) => {
          const d = normalizeDate(k.tanggalPelaksanaan);
          return d.getTime() >= today.getTime();
        });

        const riwayat = data.filter((k) => {
          const d = normalizeDate(k.tanggalPelaksanaan);
          return d.getTime() < today.getTime();
        });

        setUpcomingList(upcoming);
        setFilteredList(upcoming);

        const first = upcoming[0] || riwayat[0];
        if (first?.posyandu) {
          setPosyanduNama(first.posyandu.nama);
          setPosyanduWilayah(first.posyandu.wilayah);
          setkelurahanNama(first.posyandu.kelurahan.nama);
        }
      } catch (error: any) {
        console.error(error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKegiatan();
  }, []);

  // FILTER PROGRAM
  const handleFilter = (program: string) => {
    setSelectedProgram(program);

    if (program === 'Semua') {
      setFilteredList(upcomingList);
    } else {
      setFilteredList(
        upcomingList.filter(
          (k) => k.programKesehatan.nama.toLowerCase() === program.toLowerCase()
        )
      );
    }
  };

  // WARNA PROGRAM
  const getProgramColor = (nama: string) => {
    const lower = nama.toLowerCase();
    if (lower.includes('kia')) return 'bg-pink-100 text-pink-700';
    if (lower.includes('imunisasi')) return 'bg-blue-100 text-blue-700';
    if (lower.includes('gizi')) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  // TANGGAL HARI INI
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className=" bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* --- HEADER --- */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-emerald-700">
                Jadwal Kegiatan
              </h1>
              <p className="text-gray-500 mt-1">
                {posyanduNama
                  ? `${posyanduNama} • ${posyanduWilayah} ${kelurahanNama || ''}`
                  : '-'}
              </p>
            </div>

            {/* FILTER PROGRAM */}
            <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
              {['Semua', 'Program KIA', 'Program Imunisasi', 'Program Gizi'].map(
                (program) => (
                  <button
                    key={program}
                    onClick={() => handleFilter(program)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                      selectedProgram === program
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {program}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 mt-4"></div>

          {/* --- LIST KEGIATAN --- */}
          {loading ? (
            <div className="text-center text-gray-500 py-10">Memuat data...</div>
          ) : filteredList.length === 0 ? (
            <div className="text-center text-gray-500 py-10 italic">
              Tidak ada kegiatan yang sedang berlangsung atau akan datang.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
              {filteredList.map((kegiatan) => {
                const tanggal = new Date(kegiatan.tanggalPelaksanaan);
                const tanggalStr = tanggal.toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                });

                const kegiatanDate = normalizeDate(kegiatan.tanggalPelaksanaan);
                const isToday = kegiatanDate.getTime() === today.getTime();

                return (
                  <div
                    key={kegiatan.id}
                    className="border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${getProgramColor(
                          kegiatan.programKesehatan.nama
                        )}`}
                      >
                        {kegiatan.programKesehatan.nama}
                      </div>

                      <h2 className="text-lg font-semibold text-gray-800 mb-1">
                        {kegiatan.nama}
                      </h2>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {kegiatan.deskripsi || 'Tidak ada deskripsi.'}
                      </p>

                      <div className="mt-3 text-sm text-gray-500">
                        <p>
                          📍 {kegiatan.posyandu.nama} ({kegiatan.posyandu.wilayah})
                        </p>
                        <p>📅 {tanggalStr}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      {isToday ? (
                        <Link
                          href={`/dashboard/kader/kegiatan/${kegiatan.id}/pelaksanaan`}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
                        >
                          Masuk Pelaksanaan
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
                        >
                          Belum Dimulai
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
