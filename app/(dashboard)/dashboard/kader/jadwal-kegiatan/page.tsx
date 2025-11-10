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
  const [riwayatList, setRiwayatList] = useState<Kegiatan[]>([]);
  const [filteredList, setFilteredList] = useState<Kegiatan[]>([]);
  const [selectedProgram, setSelectedProgram] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [posyanduNama, setPosyanduNama] = useState<string>('');
  const [posyanduWilayah, setPosyanduWilayah] = useState<string>('');
  const [kelurahanNama, setkelurahanNama] = useState<string>('');


  // Pagination untuk riwayat
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 2;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = riwayatList.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(riwayatList.length / rowsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    const fetchKegiatan = async () => {
      try {
        const res = await fetch('/api/kader/jadwal-kegiatan');
        if (!res.ok) throw new Error('Gagal mengambil data kegiatan');
        const data: Kegiatan[] = await res.json();

        const today = new Date().toISOString().split('T')[0];

        const upcoming = data.filter(
          (k) => k.tanggalPelaksanaan.split('T')[0] >= today
        );
        const riwayat = data.filter(
          (k) => k.tanggalPelaksanaan.split('T')[0] < today
        );

        setUpcomingList(upcoming);
        setFilteredList(upcoming);
        setRiwayatList(riwayat);

        // Ambil posyandu dari upcoming pertama, kalau ada
        const firstKegiatan = upcoming[0] || riwayat[0]; // fallback ke riwayat
        if (firstKegiatan && firstKegiatan.posyandu) {
          setPosyanduNama(firstKegiatan.posyandu.nama);
          setPosyanduWilayah(firstKegiatan.posyandu.wilayah);
          setkelurahanNama(firstKegiatan.posyandu.kelurahan.nama);
        }
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || 'Gagal memuat jadwal kegiatan');
      } finally {
        setLoading(false);
      }
    };
    fetchKegiatan();
  }, []);

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

  const getProgramColor = (nama: string) => {
    const lower = nama.toLowerCase();
    if (lower.includes('kia')) return 'bg-pink-100 text-pink-700';
    if (lower.includes('imunisasi')) return 'bg-blue-100 text-blue-700';
    if (lower.includes('gizi')) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  const today = new Date().toISOString().split('T')[0];

  return (
  <div className="px-4 py-6 bg-gray-50 min-h-screen">
    <div className="max-w-6xl mx-auto space-y-10">
      {/* KEGIATAN AKTIF / AKAN DATANG */}
      <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-emerald-700">
              Jadwal Kegiatan
            </h1>
            <p className="text-gray-500 mt-1">
              {posyanduNama ? `${posyanduNama} • ${posyanduWilayah} ${kelurahanNama || ''}` : '-'}
            </p>
          </div>

          {/* Filter Program */}
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
              const isToday =
                kegiatan.tanggalPelaksanaan.split('T')[0] === today;

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
                        Mulai Pelaksanaan
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

      {/* RIWAYAT KEGIATAN */}
      <div className="bg-white shadow-md rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Riwayat Kegiatan</h2>

        {riwayatList.length === 0 ? (
          <div className="text-gray-500 italic">Belum ada kegiatan yang telah selesai.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-200">
              <thead className="bg-emerald-600 text-white rounded-t-lg">
                <tr>
                  <th className="px-4 py-2 text-left w-16">No</th>
                  <th className="px-4 py-2 text-left">Nama Kegiatan</th>
                  <th className="px-4 py-2 text-left">Program</th>
                  <th className="px-4 py-2 text-left">Tanggal</th>
                  <th className="px-4 py-2 text-left">Posyandu</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRows.map((kegiatan, index) => {
                  const tanggalStr = new Date(
                    kegiatan.tanggalPelaksanaan
                  ).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  });
                  return (
                    <tr key={kegiatan.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-emerald-700">
                        {indexOfFirstRow + index + 1}
                      </td>
                      <td className="px-4 py-2">{kegiatan.nama}</td>
                      <td className="px-4 py-2">{kegiatan.programKesehatan.nama}</td>
                      <td className="px-4 py-2">{tanggalStr}</td>
                      <td className="px-4 py-2">{kegiatan.posyandu.nama}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-end items-center gap-1 p-3">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`px-3 py-1 border rounded text-sm transition ${
                      currentPage === i + 1
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

}
