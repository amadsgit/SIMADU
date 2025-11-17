"use client";

import { useEffect, useState } from "react";
import TabsPane from '@/components/tab-pane-pemproKia';

type StatusPelaksanaan = "belum_mulai" | "berjalan" | "selesai";

interface Kegiatan {
  id: number;
  nama: string;
  deskripsi?: string;
  tanggalPelaksanaan?: string;
  posyandu: { id: number; nama: string; wilayah: string;
    kelurahan: any;
  };
  programKesehatan: { id: number; nama: string };
  pelaksanaan: Pelaksanaan[];
}

interface StatusGizi {
  id: number;
  tanggal: string;
  beratBadan: number;
  tinggiBadan: number;
  zScoreBBU?: number;
  zScoreTBU?: number;
  zScoreBBTB?: number;
  kategoriGizi?: string;
  statusStunting?: string;
}

interface PemeriksaanBalita {
  id: number;
  tanggal: string;
  beratBadan: number;
  tinggiBadan: number;
  lingkarKepala: number,
  imunisasi: string,
  vitamin: string,
  jenisVitamin: string,
  pmt: string,
  jenisPmt: string,
  keluhan: string,
  tindakan: string,
  catatan: string,
  balita: { 
    id: number; 
    nama: string, 
    nik:string; 
    tanggalLahir:string; 
    alamat:string; 
  };
  statusGizi: StatusGizi[];
}

interface PemeriksaanIbuHamil {
  id: number;
  tanggal: string;
  usiaKehamilan: number;
  beratBadan?: number;
  tekananDarah: number;
  tinggiFundus: number;
  detakJantungJanin: number;
  pemberianFe: boolean;
  jenisPmt: string;
  keluhan: string;
  tindakan: string;
  konseling: string;
  ibuHamil: { 
    id: number; 
    nama: string;
    nik: string;
    noKK: string;
    tanggalLahir: string;
    umurKehamilanAwal: number;
    tanggalHPHT: string;
    tanggalHPL: string;
    gravida: number;
    para: number;
    abortus: number;
    alamat: string; 
  };
}

interface Pelaksanaan {
  id: number;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  status: StatusPelaksanaan;
  posyandu: {
      id: number; 
      nama: string; 
      wilayah: string; 
      kelurahan: any;
  };
  kader: { id: number; nama: string };
  jumlahBalita: number;
  jumlahIbuHamil: number;
  catatanUmum?: string;
  pemeriksaanBalita: PemeriksaanBalita[];
  pemeriksaanIbuHamil: PemeriksaanIbuHamil[];
}


export default function MonitoringKIAPage() {
  const [data, setData] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  useEffect(() => {
    fetch("/api/pemproKia/monitoring")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-center text-green-500">Memuat Data...</div>;

  const filteredData = data.filter((k) =>
    k.nama.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-2 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Monitoring & Laporan Kegiatan KIA</h1>

      <TabsPane />

    </div>
  );
}
