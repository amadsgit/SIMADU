import {
  BabyIcon,
  HeartPulseIcon,
  StethoscopeIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
  UsersIcon,
  FileBarChartIcon,
  PillIcon
} from 'lucide-react';
import SummaryCard from '@/app/ui/dashboard/summary-card';

export default async function Page() {
  return (
    <div className="p-6 text-gray-800">
      <h1 className="text-3xl font-bold text-emerald-700 mb-2">
        Dashboard <span className="text-emerald-500">Program KIA</span>
      </h1>
      <p className="text-gray-600 mb-8">
        Selamat datang di halaman utama Pemegang Program Kesehatan Ibu dan Anak (KIA).
        Berikut ringkasan data penting dan kegiatan pemantauan.
      </p>

      {/* Ringkasan Data KIA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <SummaryCard
          title="Jumlah Ibu Hamil Terdata"
          count="0"
          icon={<HeartPulseIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Jumlah Persalinan"
          count="0"
          icon={<StethoscopeIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Jumlah Bayi Baru Lahir"
          count="0"
          icon={<BabyIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Jumlah Ibu Nifas Terpantau"
          count="0"
          icon={<PillIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Jumlah Balita Terpantau"
          count="0"
          icon={<UsersIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Kunjungan ANC (Antenatal Care)"
          count="0"
          icon={<ClipboardListIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Jadwal Kelas Ibu Hamil"
          count="0"
          icon={<CalendarDaysIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Laporan Bulanan KIA"
          count="0"
          icon={<FileBarChartIcon className="w-7 h-7 text-emerald-600" />}
        />
      </div>
    </div>
  );
}
