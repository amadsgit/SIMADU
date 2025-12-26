'use client'

import { useState, useEffect, useMemo } from 'react';
import TabsPane from '@/components/tab-pane-manajemen-akun';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ModalKonfirmasi from '@/components/delete-confirmation';
import { RefreshCcw, Save } from 'lucide-react';
import { Role } from '@/generated/prisma';

export default function Page() {
  const [nama, setNama] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const isEdit = selectedId !== null;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(roles.length / itemsPerPage);

  const paginatedList = useMemo(() => {
    return roles.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [roles, currentPage]);

  const fetchRole = async () => {
    setLoadingFetch(true);
    try {
      const res = await fetch('/api/admin/role');
      const data = await res.json();
      setRoles(data);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat data role');
    } finally {
      setLoadingFetch(false);
    }
  };

  useEffect(() => {
    fetchRole();
  }, []);

  const resetForm = () => {
    setNama('');
    setSelectedId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      const res = await fetch(`/api/admin/role${isEdit ? `/${selectedId}` : ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama }),
      });

      if (res.ok) {
        toast.success(isEdit ? 'Role berhasil diupdate!' : 'Role berhasil disimpan!');
        await fetchRole();
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

  const handleEdit = (role: Role) => {
    setSelectedId(role.id);
    setNama(role.nama);
  };


  const openDeleteModal = (id: string) => {
    setSelectedDeleteId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (selectedDeleteId === null) return;

    try {
      const res = await fetch(`/api/admin/role/${selectedDeleteId}`, { method: 'DELETE' });

      if (res.ok) {
        toast.success('Role berhasil dihapus!');
        await fetchRole();
        resetForm();
      } else {
        const errorData = await res.json();
        if (res.status === 409 && errorData?.error) {
          toast.error(errorData.error);
        } else {
          toast.error('Gagal menghapus data!');
        }
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
          <h2 className="text-2xl font-bold">
            Manajemen Data <span>Role & Akun User</span>
          </h2>
        </div>
      </div>

      <TabsPane />

      {/* FORM */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <p className="text-md font-semibold text-gray-700 mb-4">
          {isEdit ? 'Edit Role' : 'Tambah Role'}
        </p>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={nama}
              required
              placeholder="Contoh : Admin"
              onChange={(e) => setNama(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:ring-2 focus:ring-green-500"
            />

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loadingSubmit}
                className={`inline-flex items-center gap-2 ${
                  loadingSubmit ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                } text-white font-semibold text-sm px-5 py-2 rounded-md shadow-sm transition`}
              >
                {isEdit ? (
                  <RefreshCcw className={`w-4 h-4 ${loadingSubmit ? "animate-spin-slow" : ""}`} />
                ) : (
                  <Save className="w-4 h-4" />
                )}

                {loadingSubmit
                  ? isEdit
                    ? "Mengupdate..."
                    : "Menyimpan..."
                  : isEdit
                  ? "Update"
                  : "Simpan"}
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

        {/* TABEL ROLE */}
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
              <span>Memuat data role...</span>
            </div>
          ) : (
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="p-3 border-b">No</th>
                  <th className="p-3 border-b text-left">Nama Role</th>
                  <th className="p-3 border-b text-left">Dibuat</th>
                  <th className="p-3 border-b text-left">Diupdate</th>
                  <th className="p-3 border-b">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {paginatedList.length > 0 ? (
                  paginatedList.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="p-3 border-b">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>

                      <td className="px-6 py-4 border-b">
                        <span
                          className={`px-2 py-1  rounded-full text-xs font-semibold capitalize
                            ${
                              item.nama.toLowerCase() === 'admin'
                                ? 'bg-red-100 text-red-700'
                                : item.nama.toLowerCase() === 'kader'
                                ? 'bg-purple-100 text-purple-700'
                                : item.nama.toLowerCase() === 'ibu hamil'
                                ? 'bg-pink-100 text-pink-700'
                                : item.nama.toLowerCase() === 'orang tua balita'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                          {item.nama}
                        </span>
                      </td>

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

                      <td className="p-3 border-b">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 bg-white border border-gray-300 rounded-md hover:border-teal-500 hover:text-teal-600 transition"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openDeleteModal(item.id)}
                            className="p-2 bg-white border border-gray-300 rounded-md hover:border-rose-500 hover:text-rose-600 transition"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      Tidak ada data role.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ================================
            PAGINATION UI (PERSIS USER PAGE)
        ================================= */}
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
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
      </div>

      <ModalKonfirmasi
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
