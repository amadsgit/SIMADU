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
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function PageClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalKegiatan, setTotalKegiatan] = useState(0);
  const [kegiatanBelumMulai, setKegiatanBelumMulai] = useState(0);
  const [kegiatanBerjalan, setKegiatanBerjalan] = useState(0);
  const [kegiatanSelesai, setKegiatanSelesai] = useState(0);

  const [jumlahBalitaTerdata, setJumlahBalitaTerdata] = useState(0);
  const [jumlahIbuHamilTerdata, setJumlahIbuHamilTerdata] = useState(0);
  const [jumlahStuntingNormal, setJumlahStuntingNormal] = useState(0);
  const [jumlahStuntingPendek, setJumlahStuntingPendek] = useState(0);

  const [giziLebih, setGiziLebih] = useState(0);
  const [giziBaik, setGiziBaik] = useState(0);
  const [giziKurang, setGiziKurang] = useState(0);
  const [giziBuruk, setGiziBuruk] = useState(0);

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

        setJumlahBalitaTerdata(t.totalBalita ?? 0);
        setJumlahIbuHamilTerdata(t.totalIbuHamil ?? 0);
        setJumlahStuntingNormal(t.stuntingNormal ?? 0);
        setJumlahStuntingPendek(t.stuntingPendek ?? 0);

        setGiziLebih(t.giziLebih ?? 0);
        setGiziBaik(t.giziBaik ?? 0);
        setGiziKurang(t.giziKurang ?? 0);
        setGiziBuruk(t.giziBuruk ?? 0);
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

  const dataGizi = [
    { name: "Gizi Baik", value: giziBaik },
    { name: "Risiko Gizi Lebih", value: giziLebih },
    { name: "Gizi Kurang", value: giziKurang },
    { name: "Gizi Buruk", value: giziBuruk },
  ];

  const COLORS = ["#16a34a", "#9333ea", "#eab308", "#dc2626"]; 

  return (
    <div className="p-2 text-gray-800 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-emerald-700 mb-2">
          Dashboard <span className="text-emerald-500">Program Gizi</span>
        </h1>
        <p className="text-gray-600 mb-8">
          Selamat datang kembali 👋 di halaman utama Pemegang Program Kesehatan Gizi.
        </p>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm p-6 hover:shadow-md transition duration-200">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Distribusi Kategori Gizi Balita</h2>
          <span className="text-sm text-gray-500">Update otomatis</span>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={dataGizi}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey="value"
                label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {dataGizi.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px", padding: "8px 12px" }} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <SummaryCard title="Jumlah Ibu Hamil Terdata" count={jumlahIbuHamilTerdata} icon={<HeartPulseIcon className="w-7 h-7 text-emerald-600" />} />
        <SummaryCard title="Jumlah Balita Terdata" count={jumlahBalitaTerdata} icon={<UsersIcon className="w-7 h-7 text-emerald-600" />} />
        <SummaryCard title="Balita Tinggi Normal" count={jumlahStuntingNormal} icon={<BabyIcon className="w-7 h-7 text-emerald-600" />} />
        <SummaryCard title="Balita Stunting" count={jumlahStuntingPendek} icon={<BabyIcon className="w-7 h-7 text-red-600" />} />
        <SummaryCard title="Jumlah Kegiatan Gizi" count={totalKegiatan} icon={<ClipboardListIcon className="w-7 h-7 text-emerald-600" />} />
        <SummaryCard title="Kegiatan Belum Mulai" count={kegiatanBelumMulai} icon={<ClockIcon className="w-7 h-7 text-yellow-600" />} />
        <SummaryCard title="Kegiatan Sedang Berjalan" count={kegiatanBerjalan} icon={<LoaderIcon className="w-7 h-7 text-blue-600 animate-spin-slow" />} />
        <SummaryCard title="Kegiatan Selesai" count={kegiatanSelesai} icon={<CheckCircleIcon className="w-7 h-7 text-green-600" />} />
      </div>
    </div>
  );
}