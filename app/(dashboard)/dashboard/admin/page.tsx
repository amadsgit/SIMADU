import {
  UsersIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import SummaryCard from '@/app/ui/dashboard/summary-card';
import { getTotalPosyandu } from '@/lib/data-posyandu';
import { getTotalKader } from '@/lib/data-kader';
import { getTotalUser } from '@/lib/data-user';
import { getTotalKelurahan } from '@/lib/data-wilayah-kerja';
import PosyanduChart from '@/components/posyandu-chart';
import { MapIcon } from 'lucide-react';


export default async function Page() {
  const totalPosyandu = await getTotalPosyandu();
  const totalKader = await getTotalKader();
  const TotalKelurahan = await getTotalKelurahan();
  const TotalUser = await getTotalUser();

  return (
    <div className="p-6 text-gray-800">
      <h1 className="text-3xl font-bold text-emerald-700 mb-2">
        Dashboard <span className="text-emerald-500">Admin</span>
      </h1>
      <p className="text-gray-600 mb-8">
        Selamat datang, berikut ringkasan informasi data E-Posyandu..
      </p>

      {/* Ringkasan Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Jumlah Data Posyandu"
          count={(totalPosyandu ?? 0).toString()}
          icon={<UsersIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Jumlah Data Kader"
          count={(totalKader ?? 0).toString()}
          icon={<ClipboardDocumentListIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Jumlah Kelurahan/Desa"
          count={(TotalKelurahan ?? 0).toString()}
          icon={<MapIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Jumlah Data User"
          count={(TotalUser ?? 0).toString()}
          icon={<DocumentTextIcon className="w-7 h-7 text-emerald-600" />}
        />
      </div>

      <div className="bg-white rounded-xl mt-5 shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Grafik Statistik Posyandu</h2>
        <PosyanduChart />
      </div>
    </div>
  );
}
