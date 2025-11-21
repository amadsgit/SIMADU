"use client";

import React, { useEffect, useState } from "react";
import {
  BabyIcon,
  HeartPulseIcon,
  ClipboardListIcon,
  UsersIcon,
  ClockIcon,
  LoaderIcon,
  CheckCircleIcon,
} from "lucide-react";
import SummaryCard from "@/app/ui/dashboard/summary-card";
import ChartCard from "@/components/chart-card";
import KategoriGiziChart from '@/components/chart-kategorigizi';
import BalitaStuntingChart from '@/components/chart-balitastunting';
import BumilKEKChart from '@/components/chart-bumilKEK';

export default function PageClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalKegiatan, setTotalKegiatan] = useState(0);
  const [kegiatanBelumMulai, setKegiatanBelumMulai] = useState(0);
  const [kegiatanBerjalan, setKegiatanBerjalan] = useState(0);
  const [kegiatanSelesai, setKegiatanSelesai] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const resDashboard = await fetch("/api/pemproGizi/dashboard", { cache: "no-store" });
        const jsonDash = await resDashboard.json();
        const d = jsonDash?.data ?? {};

        setTotalKegiatan(d.totalKegiatan ?? 0);
        setKegiatanBelumMulai(d.kegiatanBelumMulai ?? 0);
        setKegiatanBerjalan(d.kegiatanBerjalan ?? 0);
        setKegiatanSelesai(d.kegiatanSelesai ?? 0);

        const resTotal = await fetch("/api/pemproGizi/dashboard/total", { cache: "no-store" });
        const jsonTotal = await resTotal.json();
        const t = jsonTotal?.data ?? {};

      } catch (err: any) {
        setError(err?.message ?? "Gagal mengambil data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div className="p-6 text-emerald-600 text-center animate-pulse">Memuat data dashboard...</div>;
  if (error) return <div className="p-6 text-red-600 text-center">Error: {error}</div>;

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold text-emerald-700 mb-2">
          Dashboard <span className="text-emerald-500">Program Gizi</span>
        </h1>
        <p className="text-gray-600 mb-8">
          Selamat datang kembali 👋 di halaman utama Pemegang Program Kesehatan Gizi.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <SummaryCard title="Jumlah Kegiatan Gizi" count={totalKegiatan} icon={<ClipboardListIcon className="w-7 h-7 text-emerald-600" />} />
        <SummaryCard title="Kegiatan Belum Mulai" count={kegiatanBelumMulai} icon={<ClockIcon className="w-7 h-7 text-yellow-600" />} />
        <SummaryCard title="Kegiatan Sedang Berjalan" count={kegiatanBerjalan} icon={<LoaderIcon className="w-7 h-7 text-blue-600 animate-spin-slow" />} />
        <SummaryCard title="Kegiatan Selesai" count={kegiatanSelesai} icon={<CheckCircleIcon className="w-7 h-7 text-green-600" />} />
      </div>
      
      <ChartCard title="Statistik Ibu Hamil Kondisi Kurang Energi Kronis (KEK)" height="300px">
        <BumilKEKChart />
      </ChartCard>

      <ChartCard title="Statistik Kategori Gizi Balita" height="300px">
        <KategoriGiziChart />
      </ChartCard>

      <ChartCard title="Statistik Balita Stunting" height="300px">
        <BalitaStuntingChart />
      </ChartCard>
    </div>
  );
}