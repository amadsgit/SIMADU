"use client";

import React, { useEffect, useState } from "react";
import {
  BabyIcon,
  HeartPulseIcon,
  ClipboardListIcon,
  UsersIcon,
  ClockIcon,
  LoaderIcon,
  CheckCircleIcon
} from "lucide-react";
import SummaryCard from "@/app/ui/dashboard/summary-card";
import ChartCard from "@/components/chart-card";
import KategoriGiziChart from '@/components/chart-kategorigizi';
import BalitaStuntingChart from '@/components/chart-balitastunting';
import BumilKEKChart from '@/components/chart-bumilKEK';

type AnyObj = any;

export default function PageClient() {
  const [data, setData] = useState<AnyObj[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalKegiatan, setTotalKegiatan] = useState<number>(0);

  const [jumlahBalitaTerdata, setJumlahBalitaTerdata] = useState<number>(0);
  const [jumlahIbuHamilTerdata, setJumlahIbuHamilTerdata] = useState<number>(0);

  const [jumlahStuntingNormal, setJumlahStuntingNormal] = useState<number>(0);
  const [jumlahStuntingPendek, setJumlahStuntingPendek] = useState<number>(0);

  const [kegiatanBelumMulai, setKegiatanBelumMulai] = useState<number>(0);
  const [kegiatanBerjalan, setKegiatanBerjalan] = useState<number>(0);
  const [kegiatanSelesai, setKegiatanSelesai] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const resDashboard = await fetch("/api/pemproKia/dashboard", {
          cache: "no-store",
        });

        if (!resDashboard.ok) {
          const txt = await resDashboard.text();
          throw new Error(`HTTP ${resDashboard.status} - ${txt}`);
        }

        const jsonDashboard = await resDashboard.json();
        const items: AnyObj[] = jsonDashboard?.data ?? [];

        setData(items);

        const kegiatanArr = items ?? [];
        setTotalKegiatan(kegiatanArr.length);

        // Hitung status gizi
        const semuaStatusGizi = kegiatanArr.flatMap((k: AnyObj) =>
          (k.pelaksanaan ?? []).flatMap((p: AnyObj) =>
            (p.pemeriksaanBalita ?? []).flatMap(
              (pb: AnyObj) => pb.statusGizi ?? []
            )
          )
        );

        const normalCount = semuaStatusGizi.filter(
          (s: AnyObj) =>
            String(s?.statusStunting ?? "").trim().toLowerCase() === "normal"
        ).length;

        const pendekCount = semuaStatusGizi.filter((s: AnyObj) => {
          const st = String(s?.statusStunting ?? "")
            .trim()
            .toLowerCase();
          return st === "pendek" || st === "sangat pendek";
        }).length;

        setJumlahStuntingNormal(normalCount);
        setJumlahStuntingPendek(pendekCount);

        // Normalisasi status
        const normalize = (v: any) =>
          String(v ?? "")
            .replace(/[_-]/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();

        const semuaPelaksanaan = kegiatanArr.flatMap(
          (k: AnyObj) => (k.pelaksanaan ?? []).map((p: AnyObj) => p)
        );

        let belumMulai = 0;
        let berjalan = 0;
        let selesai = 0;

        for (const p of semuaPelaksanaan) {
          const st = normalize(p?.status);

          if (st === "belum mulai") {
            belumMulai++;
            continue;
          }

          if (st === "berjalan") {
            berjalan++;
            continue;
          }

          if (st === "selesai" || st === "completed") {
            selesai++;
            continue;
          }

          const hasStart = !!p?.tanggalMulai;
          const hasEnd = !!p?.tanggalSelesai;

          if (hasStart && !hasEnd) berjalan++;
          else if (hasEnd) selesai++;
          else belumMulai++;
        }

        setKegiatanBelumMulai(belumMulai);
        setKegiatanBerjalan(berjalan);
        setKegiatanSelesai(selesai);

        // Ambil total balita & ibu hamil
        const resTotal = await fetch("/api/pemproKia/dashboard/total", {
          cache: "no-store",
        });

        if (!resTotal.ok) {
          const txt = await resTotal.text();
          throw new Error(`HTTP ${resTotal.status} - ${txt}`);
        }

        const jsonTotal = await resTotal.json();

        setJumlahBalitaTerdata(jsonTotal?.data?.totalBalita ?? 0);
        setJumlahIbuHamilTerdata(jsonTotal?.data?.totalIbuHamil ?? 0);
      } catch (err: any) {
        console.error("[Dashboard KIA] fetch error:", err);
        setError(err?.message ?? "Gagal mengambil data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="p-6 text-emerald-600 text-center">
        Memuat data dashboard...
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-red-600 text-center">
        Error: {error}
      </div>
    );

  return (
    <div>
      <h1 className="text-3xl font-bold text-emerald-700 mb-2">
        Dashboard <span className="text-emerald-500">Program KIA</span>
      </h1>
      <p className="text-gray-600 mb-8">
        Selamat datang kembali 👋 di halaman utama Pemegang Program Kesehatan Ibu dan Anak (KIA).
      </p>

      {/* Ringkasan Data KIA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* <SummaryCard
          title="Jumlah Ibu Hamil Terdata"
          count={jumlahIbuHamilTerdata}
          icon={<HeartPulseIcon className="w-7 h-7 text-emerald-600" />}
        />

        <SummaryCard
          title="Jumlah Balita Terdata"
          count={jumlahBalitaTerdata}
          icon={<UsersIcon className="w-7 h-7 text-emerald-600" />}
        />

        <SummaryCard
          title="Balita Tinggi Normal"
          count={jumlahStuntingNormal}
          icon={<BabyIcon className="w-7 h-7 text-emerald-600" />}
        />

        <SummaryCard
          title="Balita Stunting (Pendek/Sangat Pendek)"
          count={jumlahStuntingPendek}
          icon={<BabyIcon className="w-7 h-7 text-red-600" />}
        /> */}

        <SummaryCard
          title="Jumlah Kegiatan KIA"
          count={totalKegiatan}
          icon={<ClipboardListIcon className="w-7 h-7 text-emerald-600" />}
        />

        <SummaryCard
          title="Kegiatan Belum Mulai"
          count={kegiatanBelumMulai}
          icon={<ClockIcon className="w-7 h-7  text-yellow-600" />}
        />

        <SummaryCard
          title="Kegiatan Sedang Berjalan"
          count={kegiatanBerjalan}
          icon={<LoaderIcon className="w-7 h-7 text-blue-600 animate-spin-slow" />}
        />

        <SummaryCard
          title="Kegiatan Selesai"
          count={kegiatanSelesai}
          icon={<CheckCircleIcon className="w-7 h-7 text-green-600" />}
        />
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
