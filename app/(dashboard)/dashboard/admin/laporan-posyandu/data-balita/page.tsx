'use client'

import { useState, useEffect, useMemo } from 'react';
import TabsPane from '@/components/tab-pane-manajemen-laporan';
import toast from 'react-hot-toast';
import { Role } from '@/generated/prisma';

export default function Page() {
  const [nama, setNama] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingFetch, setLoadingFetch] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

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
      const res = await fetch('/api/kader/balita');
      const data = await res.json();
      setRoles(data);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat data role');
    } finally {
      setLoadingFetch(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-2xl font-bold">
            Laporan dan Rekap Data Posyandu
          </h2>
        </div>
      </div>
      <TabsPane />


    </div>
  );
}
