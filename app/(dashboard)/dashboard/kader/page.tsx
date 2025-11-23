'use client';

import { useEffect, useState } from "react";
import {
  BabyIcon,
  UsersIcon,
  ClipboardListIcon,
  ClockIcon,
  CheckCircleIcon,
  LoaderIcon
} from "lucide-react";

import SummaryCard from "@/app/ui/dashboard/summary-card";

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

export default function Page() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loading = isLoading;

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/kader/dashboard", { cache: "no-store" });

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
          totalStatusGizi: d.dashboard.totalStatusGizi,
        });
      } catch (err) {
        console.error(err);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) return <div className="flex justify-center items-center py-16 text-emerald-600">
        <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span className="text-sm font-medium">Memuat data...</span>
      </div>;
  if (!data) return <div className="p-6 text-red-600 text-center">Gagal memuat data dashboard.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-emerald-700 mb-2">
        Dashboard <span className="text-emerald-500">Kader</span> {data.posyandu} ({data.wilayah}) {data.kelurahan}
      </h1>

      <p className="text-gray-600 mb-8">
       Selamat datang kembali 👋 di halaman utama kader posyandu berikut ringkasan aktivitas posyandu Anda.
      </p>

      {/* === GRID CARD === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        <SummaryCard
          title="Pemeriksaan Balita"
          count={loading ? "..." : data.totalPemeriksaanBalita}
          icon={<BabyIcon className="w-7 h-7 text-emerald-600" />}
        />

        <SummaryCard
          title="Pemeriksaan Ibu Hamil"
          count={loading ? "..." : data.totalPemeriksaanIbuHamil}
          icon={<UsersIcon className="w-7 h-7 text-emerald-600" />}
        />

        <SummaryCard
          title="Status Gizi Tercatat"
          count={loading ? "..." : data.totalStatusGizi}
          icon={<BabyIcon className="w-7 h-7 text-emerald-600" />}
        />

        <SummaryCard
          title="Balita Stunting (Pendek/Sangat Pendek)"
          count={loading ? "..." : data.totalStunting}
          icon={<BabyIcon className="w-7 h-7 text-red-600" />}
        />

        <SummaryCard
          title="Total Kegiatan"
          count={loading ? "..." : data.totalPelaksanaanKegiatan}
          icon={<ClipboardListIcon className="w-7 h-7 text-emerald-600" />}
        />

        <SummaryCard
          title="Kegiatan Belum Mulai"
          count={loading ? "..." : data.totalBelumMulai}
          icon={<ClockIcon className="w-7 h-7 text-yellow-600" />}
        />

        <SummaryCard
          title="Kegiatan Berjalan"
          count={loading ? "..." : data.totalBerjalan}
          icon={<LoaderIcon className="w-7 h-7 text-blue-600 animate-spin-slow" />}
        />

        <SummaryCard
          title="Kegiatan Selesai"
          count={loading ? "..." : data.totalSelesai}
          icon={<CheckCircleIcon className="w-7 h-7 text-green-600" />}
        />

      </div>
    </div>
  );
}
