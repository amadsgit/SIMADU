'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  FileTextIcon,
  PlusCircle,
} from 'lucide-react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import ModalKonfirmasi from '@/components/delete-confirmation';
import toast from 'react-hot-toast';

const Calendar = dynamic(() => import('react-calendar'), { ssr: false });

type Kegiatan = {
  id: number;
  nama: string;
  deskripsi?: string;
  tanggalPelaksanaan: string;
  alamat?: string;
  posyandu?: {
    nama: string;
    alamat?: string;
    wilayah?: string;
    kelurahan?: {
      nama: string;
    };
  };
  programKesehatan?: {
    nama: string;
  };
};

export default function JadwalKegiatanPage() {
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Tambahkan state untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Hitung data yang akan ditampilkan per halaman
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = kegiatanList.slice(indexOfFirstRow, indexOfLastRow);

  // Hitung total halaman
  const totalPages = Math.ceil(kegiatanList.length / rowsPerPage);

  // Fungsi ganti halaman
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Fetch data dari API imunisasi
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/pemproImunisasiJadwal');
        const data = await res.json();
        setKegiatanList(data);
      } catch (error) {
        console.error('Gagal fetch data imunisasi:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedYMD = format(selectedDate, 'yyyy-MM-dd');
  const kegiatanTanggal = kegiatanList.filter(
    (k) =>
      format(new Date(k.tanggalPelaksanaan), 'yyyy-MM-dd') === selectedYMD
  );

  // fungsi bantu untuk status otomatis
  const getStatus = (tanggal: string): string => {
    const now = new Date();
    const date = new Date(tanggal);
    if (date.toDateString() === now.toDateString()) return 'Berlangsung';
    if (date > now) return 'Akan Datang';
    return 'Selesai';
  };

  // if (loading) {
  //   return (
  //     <div className="p-6 text-gray-700">Memuat data kegiatan imunisasi...</div>
  //   );
  // }

  // delete modal
  const openDeleteModal = (id: number) => {
    setSelectedId(id);
    setShowModal(true);
  };
  const handleDelete = async () => {
    if (selectedId === null) return;

    try {
      const res = await fetch(`/api/pemproImunisasiJadwal/${selectedId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Gagal menghapus kegiatan.');
        return;
      }

      // Update state kegiatanList
      setKegiatanList((prev) => prev.filter((k) => k.id !== selectedId));

      setShowModal(false);
      setSelectedId(null);
      toast.success(data.message || 'Kegiatan berhasil dihapus.');
    } catch (error) {
      console.error('Gagal menghapus kegiatan:', error);
      toast.error('Terjadi kesalahan saat menghapus kegiatan.');
    }
  };

  return (
    <div className="p-2 text-gray-800">
      <h1 className="text-3xl font-bold text-emerald-700 mb-2">
        Jadwal Kegiatan <span className="text-emerald-500">Program Imunisasi</span>
      </h1>
      <p className="text-gray-600 mb-8">
        Data jadwal kegiatan Posyandu untuk program imunisasi di wilayah kerja
        Puskesmas.
      </p>

      <div className="mb-4 flex gap-4 items-center text-sm text-gray-600">
        <CalendarDaysIcon className="w-5 h-5 text-emerald-600" />
        <span>Kalender & Daftar Kegiatan Imunisasi</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kalender */}
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-emerald-700 font-semibold text-lg">Kalender Kegiatan</h2>
                
                <Link href="/dashboard/pempro-imunisasi/jadwal-kegiatan/create">
                    <button className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2 rounded-md shadow-sm transition">
                    <PlusCircle className="w-4 h-4 text-white text-bold" />
                    Kegiatan
                    </button>
                </Link>
            </div>

            {/* Status Legend */}
            <div className="flex flex-wrap gap-3 text-xs mb-5">
                <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-400" /> Akan Datang
                </div>
                <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-yellow-400" /> Berlangsung
                </div>
                <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-emerald-400" /> Selesai
                </div>
            </div>

            {/* Calendar */}
            <Calendar
                onChange={(d) => setSelectedDate(d as Date)}
                value={selectedDate}
                locale="id-ID"
                tileClassName={({ date }) => {
                const kegiatan = kegiatanList.find(
                    (k) =>
                    format(new Date(k.tanggalPelaksanaan), 'yyyy-MM-dd') ===
                    format(date, 'yyyy-MM-dd')
                );
                if (kegiatan) {
                    const status = getStatus(kegiatan.tanggalPelaksanaan);
                    if (status === 'Akan Datang') return 'bg-blue-100 rounded-full';
                    if (status === 'Berlangsung') return 'bg-yellow-100 rounded-full';
                    if (status === 'Selesai') return 'bg-emerald-100 rounded-full';
                }
                return '';
                }}
            />
        </div>


        {/* Kegiatan pada tanggal terpilih */}
        <div className="bg-white rounded-2xl shadow p-4 border flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="text-emerald-700 font-semibold flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              Kegiatan pada{' '}
              {format(selectedDate, 'dd MMMM yyyy', { locale: id })}
            </div>
            <div className="text-sm text-gray-500">
              Total: {kegiatanTanggal.length}
            </div>
          </div>

          <div className="space-y-3 overflow-auto max-h-[60vh]">
            {kegiatanTanggal.length > 0 ? (
              kegiatanTanggal.map((k) => (
                <div
                  key={k.id}
                  className="p-3 border rounded-lg hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-emerald-700">
                    {k.nama}
                  </h3>
                  {k.deskripsi && (
                    <p className="text-sm text-gray-600 mt-1">{k.deskripsi}</p>
                  )}
                  <div className="mt-2 text-sm text-gray-600 flex items-center gap-3">
                    <MapPinIcon className="w-4 h-4 text-emerald-500" />
                    <span>
                      {k.alamat || k.posyandu?.alamat} (
                      {k.posyandu?.nama || 'Posyandu'})<br />
                      {k.posyandu?.wilayah || '-'}, Kel. {k.posyandu?.kelurahan?.nama || '-'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-2 italic">
                    Status: {getStatus(k.tanggalPelaksanaan)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 italic">
                Tidak ada kegiatan pada tanggal ini.
              </div>
            )}
          </div>
        </div>

        {/* Tabel semua kegiatan */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4 border">
          <div className="flex items-center justify-between mb-3">
            <div className="text-emerald-700 font-semibold flex items-center gap-2">
              <FileTextIcon className="w-5 h-5" />
              Daftar Seluruh Kegiatan Imunisasi
            </div>
            <div className="text-sm text-gray-500">
              Total kegiatan: {kegiatanList.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-gray-500 border-b">
                <tr>
                  <th className="py-2 px-3">No</th>
                  <th className="py-2 px-3">Nama Kegiatan</th>
                  <th className="py-2 px-3">Tanggal</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Lokasi</th>
                  <th className="py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-6 text-gray-500 italic"
                    >
                      Belum ada data kegiatan
                    </td>
                  </tr>
                ) : (
                  currentRows.map((k, index) => (
                    <tr key={k.id} className="odd:bg-gray-50">
                      <td className="py-3 px-3 font-medium text-emerald-700">
                        {indexOfFirstRow + index + 1}
                      </td>
                      <td className="py-3 px-3">{k.nama}</td>
                      <td className="py-3 px-3 capitalize">
                        {format(new Date(k.tanggalPelaksanaan), "EEEE, dd MMM yyyy", { locale: id })}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={
                            getStatus(k.tanggalPelaksanaan) === 'Akan Datang'
                              ? 'inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs'
                              : getStatus(k.tanggalPelaksanaan) === 'Berlangsung'
                              ? 'inline-flex px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs'
                              : 'inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs'
                          }
                        >
                          {getStatus(k.tanggalPelaksanaan)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {k.posyandu?.nama || '-'}
                        <br />
                        <span className="text-xs text-gray-500">
                          {k.posyandu?.wilayah || '-'}, Kel. {k.posyandu?.kelurahan?.nama || '-'}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-center items-center gap-2">
                          <Link
                            href={`/dashboard/pempro-imunisasi/jadwal-kegiatan/${k.id}/edit`}
                            className="p-2 rounded-md bg-white border border-gray-300 hover:border-teal-500 hover:text-teal-600 transition"
                            title="Edit"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => openDeleteModal(k.id)}
                            className="p-2 rounded-md bg-white border border-gray-300 hover:border-rose-500 hover:text-rose-600 transition"
                            title="Hapus"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-end mt-3 gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`px-3 py-1 border rounded ${
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
        </div>
      </div>

      <ModalKonfirmasi
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
