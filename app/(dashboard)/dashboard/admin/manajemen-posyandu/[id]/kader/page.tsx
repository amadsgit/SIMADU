'use client';

import { useParams } from 'next/navigation';
import FormKader from './FormKader';
import ListKader from './ListKader';
import { useRouter } from 'next/navigation';
import ButtonKembali from '@/components/button-kembali';
import { useState } from 'react';

export default function PageKader() {
  const params = useParams(); 
  const router = useRouter();
  const posyanduId = Number(params.id);

  const [selectedKader, setSelectedKader] = useState(null);

  const handleEdit = (kader: any) => {
    setSelectedKader(kader);
  };

  const handleSuccess = () => {
    setSelectedKader(null); // reset setelah simpan
  };

  return (
    <div>
      <div className="flex mb-3 items-center justify-between">
        <h2 className="text-2xl font-bold mb-4">Manajemen Kader Posyandu</h2>
          <ButtonKembali onClick={() => router.back()} />
      </div>

      <FormKader
        posyanduId={posyanduId}
        selectedKader={selectedKader}
        onSuccess={handleSuccess}
        onEditDone={() => setSelectedKader(null)}
      />

      <ListKader
        posyanduId={posyanduId}
        onEdit={handleEdit} // kirim ke ListKader
      />
    </div>
  );
}
