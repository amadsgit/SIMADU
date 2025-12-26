'use client'

import { useState, useEffect } from 'react';
import TabsPane from '@/components/tab-pane-manajemen-posyandu';
import { MapIcon, RefreshCcw, Save } from 'lucide-react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ModalKonfirmasi from '@/components/delete-confirmation';
import { Kelurahan } from '@/generated/prisma';

export default function Page() {
  const [nama, setNama] = useState('');
  const [kelurahanList, setKelurahanList] = useState<Kelurahan[]>([]);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);

  const isEdit = selectedId !== null;

  // ==============================
  // PAGINATION STATE
  // ==============================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const totalPages = Math.ceil(kelurahanList.length / itemsPerPage);

  const paginatedKelurahan = kelurahanList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ==============================

  const fetchKelurahan = async () => {
    setLoadingFetch(true);
    try {
      const res = await fetch('/api/admin/wilayah-kerja');
      const data = await res.json();
      setKelurahanList(data);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat data kelurahan/desa');
    } finally {
      setLoadingFetch(false);
    }
  };

  useEffect(() => {
    fetchKelurahan();
  }, []);

  const resetForm = () => {
    setNama('');
    setSelectedId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      const res = await fetch(`/api/admin/wilayah-kerja${isEdit ? `/${selectedId}` : ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama }),
      });

      if (res.ok) {
        toast.success(isEdit ? 'Kelurahan/Desa berhasil diupdate!' : 'Kelurahan/Desa berhasil disimpan!');
        await fetchKelurahan();
        resetForm();
      } else {
        const { message } = await res.json();
        toast.error(message || 'Gagal menyimpan data');
      }
    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleEdit = (kelurahan: Kelurahan) => {
    setSelectedId(kelurahan.id);
    setNama(kelurahan.nama);
  };

  const openDeleteModal = (id: number) => {
    setSelectedDeleteId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (selectedDeleteId === null) return;
    try {
      const res = await fetch(`/api/admin/wilayah-kerja/${selectedDeleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Kelurahan/Desa berhasil dihapus!');
        await fetchKelurahan();
        resetForm();
      } else if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 409 && errorData?.error) {
          toast.error(errorData.error);
        } else {
          toast.error('Gagal menghapus data!');
        }
        return;
      }
    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan saat menghapus data');
    } finally {
      setShowModal(false);
      setSelectedDeleteId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-2xl font-bold">Manajemen Data <span>Posyandu & Kader</span></h2>
        </div>
      </div>

      <TabsPane />

      {/* Form & List */}
      <div className="bg-white dark:bg-white rounded-xl shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-gray-700">
          <MapIcon className="w-5 h-5" /> Wilayah Kerja Puskesmas
        </h2>

        {/* Form */}
        <p className="text-md font-semibold text-gray-700 mb-2">
          {isEdit ? 'Edit Kelurahan / Desa' : 'Tambah Kelurahan / Desa'}
        </p>
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Contoh : Pasirkareumbi"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loadingSubmit}
                className={`inline-flex items-center gap-2 ${
                  loadingSubmit ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                } text-white font-semibold text-sm px-5 py-2 rounded-md shadow-sm transition duration-150 ease-in-out`}
              >
                {isEdit ? (
                  <RefreshCcw className={`w-4 h-4 ${loadingSubmit ? 'animate-spin-slow' : ''}`} />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loadingSubmit
                  ? isEdit
                    ? 'Mengupdate...'
                    : 'Menyimpan...'
                  : isEdit
                  ? 'Update'
                  : 'Simpan'}
              </button>

              {isEdit && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Table List */}
        <div className="overflow-x-auto">
          {loadingFetch ? (
            <div className="flex justify-center items-center py-16 text-emerald-600">
              <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span className="text-sm font-medium">Memuat data kelurahan/desa...</span>
            </div>
          ) : (
            <>
              <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-3 border-b border-gray-200">No</th>
                    <th className="p-3 border-b border-gray-200">Nama Kelurahan/Desa</th>
                    <th className="p-3 border-b border-gray-200">Dibuat</th>
                    <th className="p-3 border-b border-gray-200">Diupdate</th>
                    <th className="p-3 border-b border-gray-200">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedKelurahan.length > 0 ? (
                    paginatedKelurahan.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="p-3 border-b border-gray-100">
                          {(currentPage - 1) * itemsPerPage + (index + 1)}
                        </td>
                        <td className="p-3 border-b border-gray-100">{item.nama}</td>
                        <td className="p-3 border-b border-gray-100">
                          { (item as any)?.createdAt
                            ? new Date((item as any).createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })
                            : '-' }
                        </td>
                        <td className="p-3 border-b border-gray-100">
                          { (item as any)?.updatedAt
                            ? new Date((item as any).updatedAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })
                            : '-' }
                        </td>
                        <td className="p-3 border-b border-gray-100">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 rounded-md bg-white border border-gray-300 hover:border-teal-500 hover:text-teal-600 transition"
                              title="Edit"
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(item.id)}
                              className="p-2 rounded-md bg-white border border-gray-300 hover:border-rose-500 hover:text-rose-600 transition"
                              title="Hapus"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-3 text-center text-gray-500">
                        Belum ada data kelurahan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-end items-center gap-2 p-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 border rounded-md text-sm ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-emerald-50 text-emerald-700"
                  }`}
                >
                  Prev
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border rounded-md text-sm ${
                      currentPage === i + 1
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white hover:bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 border rounded-md text-sm ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-emerald-50 text-emerald-700"
                  }`}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <ModalKonfirmasi
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        title="Hapus Data Kelurahan/Desa"
        message="Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak bisa dibatalkan."
      />
    </div>
  );
}
