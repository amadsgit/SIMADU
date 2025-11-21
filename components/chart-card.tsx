'use client';

import { useState } from 'react';

export default function ChartCard({
  title,
  children,
  height = '400px', // default height chart
}: {
  title: string;
  children: React.ReactNode;
  height?: string; // opsional, bisa diatur saat panggil
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white rounded-xl mt-5 shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <button
          onClick={() => setOpen(!open)}
          className="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"
        >
          {open ? 'Sembunyikan' : 'Tampilkan'}
        </button>
      </div>
      {open && (
        <div style={{ height }} className="w-full">
          {children}
        </div>
      )}
    </div>
  );
}
