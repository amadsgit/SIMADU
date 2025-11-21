'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ModalKonfirmasi from '@/components/delete-confirmation';
import Search from '@/app/ui/search';
import TabsPane from '@/components/tab-pane-manajemen-akun';

type Role = {
  id: string;
  nama: string;
};

type User = {
  id: string;
  nama: string;
  email: string;
  noHp: string;
  noKK: string | null;
  nik: string;
  verifiedAt: string;
  tanggalLahir: string;
  alamat: string;
  password: string;
  role: Role | null;
};

export default function Page() {
  const [userList, setUserList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/user');
        if (!res.ok) throw new Error('Fetch gagal');
        const data = await res.json();
        setUserList(data);
      } catch (error) {
        console.error('Gagal memuat data user:', error);
        toast.error('Gagal memuat data user!');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // delete user
  const openDeleteModal = (id: string) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      const res = await fetch(`/api/user/${selectedId}`, {
        method: 'DELETE',
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result?.error || 'Gagal menghapus user!');
        return;
      }

      setUserList((prev) => prev.filter((item) => item.id !== selectedId));
      toast.success(result?.message || 'User berhasil dihapus!');
    } catch (error) {
      console.error('Gagal saat request hapus:', error);
      toast.error('Terjadi kesalahan saat menghapus user!');
    } finally {
      setShowModal(false);
      setSelectedId(null);
    }
  };

  // FILTER SEARCH
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return userList.filter((item) => item.nama.toLowerCase().includes(q));
  }, [userList, searchQuery]);

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset halaman ke 1 saat user melakukan pencarian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-2xl font-bold">
              Manajemen Data <span>Role & Akun User</span>
            </h2>
          </div>
          <Link href="/dashboard/admin/manajemen-akun/user/create">
            <button className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2 rounded-md shadow-sm transition">
              <PlusCircle className="w-4 h-4 text-white text-bold" />
              Tambah User
            </button>
          </Link>
        </div>

        <div className="flex justify-between items-center">
          <TabsPane />
        </div>

        <div className="bg-white rounded-xl shadow-md border overflow-x-auto">
          <div className="p-4 border-b border-gray-100">
            <Search
              placeholder="Cari nama user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-16 text-emerald-600">
                <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                <span className="text-sm font-medium">Memuat data user...</span>
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4 border-b">No</th>
                    <th className="px-6 py-4 text-left">Nama</th>
                    <th className="px-6 py-4 text-left">Email</th>
                    <th className="px-6 py-4 text-left">No.HP</th>
                    <th className="px-6 py-4 text-center">Role</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedList.length > 0 ? (
                    paginatedList.map((item, index) => (
                      <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                        <td className="px-4 py-4">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4">{item.nama}</td>
                        <td className="px-6 py-4">{item.email}</td>
                        <td className="px-6 py-4">{item.noHp}</td>
                        <td className="px-6 py-4">
                          {item.role?.nama ? (
                            <span className={`px-2 py-1 rounded-full text-xs
                                ${
                                  item.role.nama.toLowerCase() === 'admin'
                                    ? 'bg-red-100 text-red-700'
                                    : item.role.nama.toLowerCase() === 'kader'
                                    ? 'bg-purple-100 text-blue-700'
                                    : item.role.nama.toLowerCase() === 'ibu hamil'
                                    ? 'bg-pink-100 text-purple-700'
                                    : item.role.nama.toLowerCase() === 'orang tua balita'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                              {item.role.nama}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>

                        <td className="px-6 py-4 text-center">
                          {item.verifiedAt ? (
                            <span className="inline-block px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 text-xs text-red-800 bg-red-100 rounded-full">
                              Tidak Aktif
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <Link
                              href={`/dashboard/admin/manajemen-akun/user/${item.id}/edit`}
                              className="p-2 rounded-md bg-white border border-gray-300 hover:border-teal-500 hover:text-teal-600 transition"
                              title="Edit"
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </Link>

                            <button
                              onClick={() => openDeleteModal(item.id)}
                              className="p-2 rounded-md bg-white border border-gray-300 hover:border-rose-500 hover:text-rose-600 transition"
                              title="Hapus"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>

                            <Link
                              href={`/dashboard/admin/manajemen-akun/user/${item.id}`}
                              className="p-2 rounded-md bg-white border border-gray-300 hover:border-blue-500 hover:text-blue-600 transition"
                              title="Detail User"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-gray-500">
                        Tidak ada data user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* PAGINATION UI */}
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
