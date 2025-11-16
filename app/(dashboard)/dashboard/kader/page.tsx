'use client';

import { useEffect, useState, ReactNode } from "react";
import {
  UsersIcon,
  BabyIcon,
  SyringeIcon,
  ClipboardListIcon,
  ClockIcon,
  PlayIcon,
  CheckCircleIcon
} from "lucide-react";

type DashboardData = {
  posyandu: string;
  wilayah: string;
  kelurahan: string;
  totalPemeriksaanBalita: number;
  totalPemeriksaanIbuHamil: number;
  totalPelaksanaanKegiatan: number;
  totalBelumMulai: number;
  totalBerjalan: number;
  totalSelesai: number;
  totalStunting: number;
  totalStatusGizi: number;
};

// ============================================================
// Komponen Card
// ============================================================
function Card({
  title,
  count,
  icon
}: {
  title: string;
  count: number;
  icon: ReactNode;
}) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 flex flex-col justify-between border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
        <div className="w-10 h-10 flex items-center justify-center">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-gray-800">{count}</p>
    </div>
  );
}

// ============================================================
// Halaman Dashboard
// ============================================================
export default function Page() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/kader/dashboard");
        if (!res.ok) throw new Error("Gagal fetch dashboard");

        const d = await res.json();
        setData({
          posyandu: d.posyandu.nama,
          wilayah: d.posyandu.wilayah,
          kelurahan: d.posyandu.kelurahan,
          totalPemeriksaanBalita: d.dashboard.totalPemeriksaanBalita,
          totalPemeriksaanIbuHamil: d.dashboard.totalPemeriksaanIbuHamil,
          totalPelaksanaanKegiatan: d.dashboard.totalPelaksanaanKegiatan,
          totalBelumMulai: d.dashboard.totalBelumMulai,
          totalBerjalan: d.dashboard.totalBerjalan,
          totalSelesai: d.dashboard.totalSelesai,
          totalStunting: d.dashboard.totalStunting,
          totalStatusGizi: d.dashboard.totalStatusGizi
        });
      } catch (error) {
        console.error(error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) return <div className="p-6 text-emerald-600 text-center">Memuat data dashboard...</div>;
  if (!data) return <div className="p-6 text-red-600 text-center">Error memuat data dashboard.</div>;

  return (
    <div className="p-3 mt-1 text-gray-800">
      <h1 className="text-3xl font-bold text-emerald-700 mb-2">
        Dashboard <span className="text-emerald-500">Kader</span> {data.posyandu} ({data.wilayah} / {data.kelurahan})
      </h1>
      <p className="text-gray-600 mb-8">
        Selamat datang 👋 Berikut ringkasan aktivitas posyandu Anda.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[160px]">
        <Card
          title="Pemeriksaan Balita"
          count={data.totalPemeriksaanBalita}
          icon={<BabyIcon className="w-8 h-8 text-emerald-600" />}
        />
        <Card
          title="Pemeriksaan Ibu Hamil"
          count={data.totalPemeriksaanIbuHamil}
          icon={<UsersIcon className="w-8 h-8 text-pink-600" />}
        />
        <Card
          title="Total Stunting"
          count={data.totalStunting}
          icon={<SyringeIcon className="w-8 h-8 text-red-500" />}
        />
        <Card
          title="Status Gizi Tercatat"
          count={data.totalStatusGizi}
          icon={<BabyIcon className="w-8 h-8 text-purple-500" />}
        />
        <Card
          title="Total Kegiatan"
          count={data.totalPelaksanaanKegiatan}
          icon={<ClipboardListIcon className="w-8 h-8 text-teal-600" />}
        />
        <Card
          title="Belum Mulai"
          count={data.totalBelumMulai}
          icon={<ClockIcon className="w-8 h-8 text-yellow-500" />}
        />
        <Card
          title="Sedang Berjalan"
          count={data.totalBerjalan}
          icon={<PlayIcon className="w-8 h-8 text-blue-500" />}
        />
        <Card
          title="Selesai"
          count={data.totalSelesai}
          icon={<CheckCircleIcon className="w-8 h-8 text-green-600" />}
        />
      </div>
    </div>
  );
}
