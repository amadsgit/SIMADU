'use client'

import dynamic from 'next/dynamic';
import TabsPane from '@/components/tab-pane-manajemen-posyandu';

// Dynamic import
const PosyanduChart = dynamic(() => import('@/components/chart-posyandu'), {
  ssr: false,
});

export default function StatistikPage() {
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
        <h2 className="text-xl font-semibold mb-4">Grafik Statistik Posyandu</h2>
        <PosyanduChart />
      </div>
    </div>
  );
}
