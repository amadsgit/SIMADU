'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// import peta secara dinamis
const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[70vh] bg-emerald-50 text-emerald-600">
      Memuat peta wilayah...
    </div>
  ),
});

export default function MapSection() {
  return (
    <section className="mt-2 mx-4 md:mx-6">
      <p className="text-center text-gray-600 mb-6">
        Berikut adalah sebaran lokasi posyandu di wilayah kerja{' '}
        <strong>UPTD Puskesmas Cikalapa</strong>.
      </p>

      <div className="w-full rounded-xl overflow-hidden shadow-lg border border-emerald-100">
        <Suspense fallback={<p className="p-10 text-center text-emerald-600">Memuat peta...</p>}>
          <MapView />
        </Suspense>
      </div>
    </section>
  );
}
