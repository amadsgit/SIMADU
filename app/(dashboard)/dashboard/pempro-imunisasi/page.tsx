import {
  SyringeIcon,
  BabyIcon,
  UsersIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
  FileBarChartIcon,
  PackageIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import SummaryCard from '@/app/ui/dashboard/summary-card';

export default async function Page() {
  return (
    <div className="p-6 text-gray-800">
      <h1 className="text-3xl font-bold text-emerald-700 mb-2">
        Dashboard <span className="text-emerald-500">Program Imunisasi</span>
      </h1>
      <p className="text-gray-600 mb-8">
        Selamat datang di halaman utama Pemegang Program Imunisasi. 
        Berikut ringkasan data cakupan imunisasi, stok vaksin, dan kegiatan imunisasi.
      </p>

      {/* Ringkasan Data Imunisasi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <SummaryCard
          title="Jumlah Bayi Terdata"
          count="0"
          icon={<BabyIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Jumlah Balita Terdata"
          count="0"
          icon={<UsersIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Total Imunisasi Diberikan"
          count="0"
          icon={<SyringeIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Cakupan IDL (Imunisasi Dasar Lengkap)"
          count="0"
          icon={<ShieldCheckIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Stok Vaksin Tersedia"
          count="0"
          icon={<PackageIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Kegiatan Imunisasi Berjalan"
          count="0"
          icon={<ClipboardListIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Jadwal Posyandu / Imunisasi"
          count="0"
          icon={<CalendarDaysIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Laporan Bulanan Imunisasi"
          count="0"
          icon={<FileBarChartIcon className="w-7 h-7 text-emerald-600" />}
        />
      </div>
    </div>
  );
}
