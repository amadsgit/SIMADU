// app/ui/dashboard/summary-card.tsx
'use client';

import React from 'react';

type SummaryCardProps = {
  title: string;
  count: string | number;
  icon: React.ReactNode;
};

export default function SummaryCard({ title, count, icon }: SummaryCardProps) {
  // Optional: format number dengan pemisah ribuan jika count adalah number
  const displayCount =
    typeof count === 'number' ? count.toLocaleString('id-ID') : count;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-white shadow-sm hover:shadow-md hover:scale-[1.01] transition-all">
      <div className="bg-emerald-100 p-3 rounded-full ring-2 ring-emerald-300">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-emerald-700">{displayCount}</p>
      </div>
    </div>
  );
}
