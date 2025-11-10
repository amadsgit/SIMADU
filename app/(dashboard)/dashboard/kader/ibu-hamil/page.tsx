'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ModalKonfirmasi from '@/components/delete-confirmation';
import Search from '@/app/ui/search';

type IbuHamil = {
  id: number;
  nama: string;
  nik: string;
  noKK: string;
  tanggalLahir: string;
  umurKehamilanAwal?: number | null;
  tanggalHPHT?: string | null;
  tanggalHPL?: string | null;
  gravida?: number | null;
  para?: number | null;
  abortus?: number | null;
  alamat: string;
  posyandu: {
    id: number;
    nama: string;
    wilayah: string;
    kelurahan: { id: number; nama: string };
  };
  kader: { id: number; nama: string } | null;
  createdAt: string;
};

type SessionKader = {
  id: number;
  nama: string;
  posyandu: {
    id: number;
    nama: string;
    wilayah: string;
    alamat?: string;
    kelurahan: { id: number; nama: string };
  };
};

export default function Page() {
  const [ibuHamilList, setIbuHamilList] = useState<IbuHamil[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionKader, setSessionKader] = useState<SessionKader | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ambil data kader login
  useEffect(() => {
    const fetchSessionKader = async () => {
      try {
        const res = await fetch('/api/kader/ibuHamil/sessionKader');
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

  // Ambil daftar ibu hamil
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/kader/ibuHamil');
        if (!res.ok) throw new Error('Fetch gagal');
        const data = await res.json();
        setIbuHamilList(data);
      } catch (error) {
        console.error('Gagal memuat data ibu hamil:', error);
        toast.error('Gagal memuat data ibu hamil!');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const openDeleteModal = (id: number) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/kader/ibuHamil/${selectedId}`, { method: 'DELETE' });
      if (!res.ok) {
        toast.error('Gagal menghapus data ibu hamil!');
        return;
      }
      setIbuHamilList((prev) => prev.filter((item) => item.id !== selectedId));
      toast.success('Data Ibu Hamil berhasil dihapus!');
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat menghapus data!');
    } finally {
      setShowModal(false);
    }
  };

  // Filter berdasarkan nama
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return ibuHamilList.filter((item) => item.nama.toLowerCase().includes(q));
  }, [ibuHamilList, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-2xl font-bold">
              Manajemen Data <span className="text-pink-600">Ibu Hamil</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Informasi & manajemen data ibu hamil di posyandu Anda
            </p>
          </div>
          <Link href="/dashboard/kader/ibu-hamil/create">
            <button className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold text-sm px-4 py-2 rounded-md shadow-sm transition">
              <PlusCircle className="w-4 h-4" />
              Tambah Ibu Hamil
            </button>
          </Link>
        </div>

        {/* Info Posyandu */}
        {sessionKader && (
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-4">
            <h2 className="font-semibold text-pink-800 text-sm mb-2">Data Kader & Posyandu</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <p><span className="font-semibold">Nama Kader:</span> {sessionKader.nama}</p>
              <p><span className="font-semibold">Posyandu:</span> {sessionKader.posyandu.nama} ({sessionKader.posyandu.wilayah})</p>
              <p><span className="font-semibold">Kelurahan:</span> {sessionKader.posyandu.kelurahan.nama}</p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border overflow-x-auto">
          <div className="p-4 border-b border-gray-100">
            <Search
              placeholder="Cari nama ibu hamil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16 text-pink-600">
              <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span className="text-sm font-medium">Memuat data ibu hamil...</span>
            </div>
          ) : (
            <table className="min-w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4 text-left">#</th>
                  <th className="px-6 py-4 text-left">Nama Ibu Hamil</th>
                  <th className="px-6 py-4 text-left">No KK & NIK</th>
                  <th className="px-6 py-4 text-left">Tanggal Lahir</th>
                  <th className="px-6 py-4 text-left">Alamat</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedList.length > 0 ? (
                  paginatedList.map((item, index) => (
                    <tr key={item.id} className="border-t hover:bg-gray-50 transition duration-150 ease-in-out">
                      <td className="px-4 py-4 font-medium text-gray-700">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">{item.nama}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] bg-pink-50 text-pink-700 px-2 py-0.5 rounded-md font-medium">
                              KK
                            </span>
                            <span className="font-mono text-gray-800 text-sm">{item.noKK}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
                              NIK
                            </span>
                            <span className="font-mono text-gray-800 text-sm">{item.nik}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(item.tanggalLahir).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{item.alamat}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <Link
                            href={`/dashboard/kader/ibu-hamil/${item.id}/edit`}
                            className="p-2 rounded-md bg-white border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 shadow-sm hover:shadow transition"
                            title="Edit"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => openDeleteModal(item.id)}
                            className="p-2 rounded-md bg-white border border-gray-200 hover:border-rose-500 hover:text-rose-600 shadow-sm hover:shadow transition"
                            title="Hapus"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/dashboard/kader/ibu-hamil/${item.id}`}
                            className="p-2 rounded-md bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 shadow-sm hover:shadow transition"
                            title="Detail"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">
                      Tidak ada data ibu hamil.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 p-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm">{currentPage} / {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <ModalKonfirmasi
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
