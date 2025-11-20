"use client";

import React, { useEffect, useState } from "react";
import {
  ClipboardListIcon,
  UsersIcon,
  ClockIcon,
  LoaderIcon,
  CheckCircleIcon,
  SyringeIcon,
  ShieldCheckIcon
} from "lucide-react";
import SummaryCard from "@/app/ui/dashboard/summary-card";

type AnyObj = any;

export default function PageClient() {
  const [data, setData] = useState<AnyObj[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalKegiatan, setTotalKegiatan] = useState<number>(0);
  const [jumlahBalitaTerdata, setJumlahBalitaTerdata] = useState<number>(0);
  const [kegiatanBelumMulai, setKegiatanBelumMulai] = useState<number>(0);
  const [kegiatanBerjalan, setKegiatanBerjalan] = useState<number>(0);
  const [kegiatanSelesai, setKegiatanSelesai] = useState<number>(0);
  const [totalImunisasiDiberikan, setTotalImunisasiDiberikan] = useState(0);
  const [cakupanIDL, setCakupanIDL] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const resDashboard = await fetch("/api/pemproImunisasi/dashboard", {
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

        // =============================
        // HITUNG TOTAL IMUNISASI DIBERIKAN
        // =============================
        const semuaImunisasi = kegiatanArr.flatMap((k: AnyObj) =>
          (k.pelaksanaan ?? []).flatMap((p: AnyObj) =>
            (p.pemeriksaanBalita ?? []).filter(
              (pb: AnyObj) => pb.imunisasi && pb.imunisasi.trim() !== ""
            )
          )
        );
        const totalImunisasiDiberikan = semuaImunisasi.length;

        // =============================
        // HITUNG CAKUPAN IDL (Imunisasi Dasar Lengkap)
        // =============================
        const imunisasiPerBalita: Record<string, Set<string>> = {};

        semuaImunisasi.forEach((pb: AnyObj) => {
          const balitaId = pb.balita?.id;
          if (!balitaId) return;

          if (!imunisasiPerBalita[balitaId]) {
            imunisasiPerBalita[balitaId] = new Set();
          }

          // pisahkan imunisasi multiple (mis: "HB-0, Polio-0 (OPV), BCG")
          pb.imunisasi
            .split(",")
            .map((x: string) => x.trim())
            .forEach((jenis: string) => imunisasiPerBalita[balitaId].add(jenis));
        });

        // hitung yang memenuhi standar minimal IDL (17 jenis)
        const cakupanIDL = Object.values(imunisasiPerBalita).filter(
          (setImun) => setImun.size >= 17
        ).length;

        // Hitung status gizi
        const semuaStatusGizi = kegiatanArr.flatMap((k: AnyObj) =>
          (k.pelaksanaan ?? []).flatMap((p: AnyObj) =>
            (p.pemeriksaanBalita ?? []).flatMap(
              (pb: AnyObj) => pb.statusGizi ?? []
            )
          )
        );

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

        setTotalImunisasiDiberikan(totalImunisasiDiberikan);
        setCakupanIDL(cakupanIDL);
        setKegiatanBelumMulai(belumMulai);
        setKegiatanBerjalan(berjalan);
        setKegiatanSelesai(selesai);

        // Ambil total balita
        const resTotal = await fetch("/api/pemproImunisasi/dashboard/total", {
          cache: "no-store",
        });

        if (!resTotal.ok) {
          const txt = await resTotal.text();
          throw new Error(`HTTP ${resTotal.status} - ${txt}`);
        }

        const jsonTotal = await resTotal.json();

        setJumlahBalitaTerdata(jsonTotal?.data?.totalBalita ?? 0);
      } catch (err: any) {
        console.error("[Dashboard Imunisasi] fetch error:", err);
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
    <div className="p-6 text-gray-800">
      <h1 className="text-3xl font-bold text-emerald-700 mb-2">
        Dashboard <span className="text-emerald-500">Program Imunisasi</span>
      </h1>
      <p className="text-gray-600 mb-8">
        Selamat datang kembali 👋 di halaman utama Pemegang Program Kesehatan Imunisasi.
      </p>

      {/* Ringkasan Data Imunisasi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        <SummaryCard
          title="Jumlah Balita Terdata"
          count={jumlahBalitaTerdata}
          icon={<UsersIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Total Imunisasi Diberikan"
          count={loading ? "..." : totalImunisasiDiberikan}
          icon={<SyringeIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Cakupan IDL (Imunisasi Dasar Lengkap)"
          count={loading ? "..." : cakupanIDL}
          icon={<ShieldCheckIcon className="w-7 h-7 text-emerald-600" />}
        />
        <SummaryCard
          title="Jumlah Kegiatan Imunisasi"
          count={totalKegiatan}
          icon={<ClipboardListIcon className="w-7 h-7 text-emerald-600" />}
        />
      </div>

      {/* Grid bawah 3 kolom */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
    </div>
  );
}
