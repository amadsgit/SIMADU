import {
  BabyIcon,
  UsersIcon,
  ScaleIcon,
  SaladIcon,
  HeartPulseIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
  FileBarChartIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from 'lucide-react';
import SummaryCard from '@/app/ui/dashboard/summary-card';

export default async function Page() {
  return (
    <div className="p-6 text-gray-800">
      <h1 className="text-3xl font-bold text-emerald-700 mb-2">
        Dashboard <span className="text-emerald-500">Program Gizi</span>
      </h1>
      <p className="text-gray-600 mb-8">
        Selamat datang di halaman utama Pemegang Program Gizi. 
        Berikut ringkasan data pemantauan status gizi balita, 
        kegiatan penimbangan, serta laporan gizi masyarakat.
      </p>

      {/* Ringkasan Data Program Gizi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <SummaryCard
          title="Jumlah Balita Terdata"
          count="0"
          icon={<BabyIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Balita Gizi Baik"
          count="0"
          icon={<TrendingUpIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Balita Gizi Kurang / Buruk"
          count="0"
          icon={<TrendingDownIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Kasus Stunting Terdeteksi"
          count="0"
          icon={<HeartPulseIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Jumlah Pemeriksaan Gizi"
          count="0"
          icon={<ScaleIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Kegiatan Penimbangan Aktif"
          count="0"
          icon={<ClipboardListIcon className="w-7 h-7 text-emerald-600" />}
        />
        {/* <SummaryCard
          title="Jadwal Edukasi / Penyuluhan Gizi"
          count="0"
          icon={<CalendarDaysIcon className="w-7 h-7 text-emerald-600" />}
        /> */}
        <SummaryCard
          title="Laporan Bulanan Gizi"
          count="0"
          icon={<FileBarChartIcon className="w-7 h-7 text-emerald-600" />}
        />
      </div>
    </div>
  );
}
