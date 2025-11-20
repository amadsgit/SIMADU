'use client'

import TabsPane from '@/components/tab-pane-manajemen-posyandu';
import { MapPinIcon } from 'lucide-react';
import dynamic from 'next/dynamic';

export default function Page() {
  const MapView = dynamic(() => import('@/components/map-view'), { ssr: false });

  return (
    <div>
        <div className="flex justify-between items-center mb-3">
            <div>
                <h2 className="text-2xl font-bold">
                Manajemen Data <span className="">Posyandu & Kader</span>
                </h2>
            </div>
        </div>
        <TabsPane />

        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4"><MapPinIcon /> Peta Sebaran Posyandu</h2>
            <MapView />
        </div>
    </div>
  );
}
