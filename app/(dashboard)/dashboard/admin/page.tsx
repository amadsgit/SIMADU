import {
  UsersIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { MapIcon } from 'lucide-react';
import SummaryCard from '@/app/ui/dashboard/summary-card';
import PosyanduChart from '@/components/chart-posyandu';
import KategoriGiziChart from '@/components/chart-kategorigizi';
import BalitaStuntingChart from '@/components/chart-balitastunting';
import BumilKEKChart from '@/components/chart-bumilKEK';
import ChartCard from '@/components/chart-card';
import { getTotalPosyandu } from '@/lib/data-posyandu';
import { getTotalKader } from '@/lib/data-kader';
import { getTotalUser } from '@/lib/data-user';
import { getTotalKelurahan } from '@/lib/data-wilayah-kerja';

export default async function Page() {
  const totalPosyandu = await getTotalPosyandu();
  const totalKader = await getTotalKader();
  const totalKelurahan = await getTotalKelurahan();
  const totalUser = await getTotalUser();

  return (
    <div className="text-gray-800">
      <h1 className="text-3xl font-bold text-emerald-700 mb-2">
        Dashboard <span className="text-emerald-500">Admin</span>
      </h1>
      <p className="text-gray-600 mb-8">
        Selamat datang kembali 👋 berikut ringkasan informasi data Posyandu wilayah kerja UPTD Puskesmas Cikalapa.
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
          count={(totalKelurahan ?? 0).toString()}
          icon={<MapIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Jumlah Data User"
          count={(totalUser ?? 0).toString()}
          icon={<DocumentTextIcon className="w-7 h-7 text-emerald-600" />}
        />
      </div>

      {/* Chart Cards */}
      <ChartCard title="Statistik Posyandu" height="300px">
        <PosyanduChart />
      </ChartCard>

      <ChartCard title="Statistik Kategori Gizi Balita" height="300px">
        <KategoriGiziChart />
      </ChartCard>

      <ChartCard title="Statistik Balita Stunting" height="300px">
        <BalitaStuntingChart />
      </ChartCard>
      
      <ChartCard title="Statistik Ibu Hamil Kondisi Kurang Energi Kronis (KEK)" height="300px">
        <BumilKEKChart />
      </ChartCard>
    </div>
  );
}
