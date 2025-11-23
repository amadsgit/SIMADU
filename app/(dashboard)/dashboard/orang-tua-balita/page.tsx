'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import ChartCard from '@/components/chart-card';
import GrafikBBU from '@/components/kms/GrafikBBU';
import GrafikTBU from '@/components/kms/GrafikTBU';
import GrafikBBTB from '@/components/kms/GrafikBBTB';

interface Pemeriksaan {
  id: number;
  tanggal: string;
  beratBadan: number;
  tinggiBadan: number;
  lingkarKepala: number;
  imunisasi: string;
  pmt: boolean;
  jenisPmt: string | null;
}

interface StatusGizi {
  kategoriGizi: string;
  statusStunting: string;
}

interface Posyandu {
  nama: string;
  alamat: string;
  wilayah: string;
  kelurahan: { nama: string };
}

interface Kader {
  nama: string;
}

interface Balita {
  id: number;
  nama: string;
  nik: string;
  noKK: string;
  tanggalLahir: string;
  jenisKelamin: string;
  namaAyah: string;
  namaIbu: string;
  beratLahir: number;
  panjangLahir: number;
  alamat: string;
  posyandu: Posyandu;
  kader: Kader;
  pemeriksaanBalita: Pemeriksaan[];
  statusGizi: StatusGizi[];
}

export default function DashboardOrtuBalita() {
  const [balitaList, setBalitaList] = useState<Balita[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchBalita();
  }, []);

  const fetchBalita = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ortubalita');
      const data = await res.json();
      if (res.ok && data.success) setBalitaList(data.data);
      else toast.error(data.error || 'Gagal mengambil data balita');
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (tanggal: string) => {
    const lahir = new Date(tanggal);
    const sekarang = new Date();
    let tahun = sekarang.getFullYear() - lahir.getFullYear();
    let bulan = sekarang.getMonth() - lahir.getMonth();
    if (bulan < 0) {
      tahun--;
      bulan += 12;
    }
    return `${tahun} tahun ${bulan} bulan`;
  };

  const getBadgeColor = (status: string) => {
    if (status.toLowerCase() === 'gizi baik' || status.toLowerCase() === 'normal') return 'bg-green-500';
    if (status.toLowerCase() === 'kurang gizi' || status.toLowerCase() === 'pendek') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div >
      <h1 className="text-2xl font-bold text-emerald-700 mb-2">
        Dashboard <span className="text-emerald-500">Orang Tua Balita</span>
      </h1>
      <p className="text-gray-600 mb-8">
        Hallo.. Selamat datang kembali 👋 ini adalah halaman pemantauan tumbuh kembang balita anda.
      </p>

      {loading ? (
        <div className="flex justify-center items-center py-16 text-emerald-600">
            <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span className="text-sm font-medium">Memuat data...</span>
          </div>
      ) : balitaList.length === 0 ? (
        <div className="text-center text-gray-500">Belum ada data balita.</div>
      ) : (
        <div className="space-y-6">
          {balitaList.map((balita, idx) => {
            const lastPemeriksaan = balita.pemeriksaanBalita[balita.pemeriksaanBalita.length - 1];
            const lastGizi = balita.statusGizi[balita.statusGizi.length - 1];

            return (
              <motion.div
                key={balita.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white border-l-4 border-emerald-500 shadow-md rounded-xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                {/* Header Balita */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2 md:gap-0">
                  <h2 className="text-2xl font-semibold text-gray-800">{balita.nama} ({balita.jenisKelamin})</h2>
                  <h3 className="text-gray-600 text-left md:text-right text-sm">
                    Lahir: {new Date(balita.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
                    Umur: {calculateAge(balita.tanggalLahir)}
                  </h3>
                </div>

                {/* Detail Card */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
                >
                  <div className="space-y-1">
                    <p><span className="font-medium">Ayah:</span> {balita.namaAyah}</p>
                    <p><span className="font-medium">Ibu:</span> {balita.namaIbu}</p>
                    <p><span className="font-medium">Alamat:</span> {balita.alamat}</p>
                  </div>
                  <div className="space-y-1">
                    <p><span className="font-medium">Posyandu:</span> {balita.posyandu.nama}</p>
                    <p><span className="font-medium">Wilayah:</span> {balita.posyandu.wilayah}</p>
                    <p><span className="font-medium">Kelurahan:</span> {balita.posyandu.kelurahan.nama}</p>
                    <p><span className="font-medium">Kader:</span> {balita.kader.nama}</p>
                  </div>
                </motion.div>

                {lastPemeriksaan && lastGizi && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-emerald-50 p-4 rounded-lg shadow-inner"
                  >
                    <h3 className="text-lg font-semibold mb-2 text-emerald-700">
                      Pemeriksaan Terakhir
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-gray-700">
                      <p><span className="font-medium">Berat Badan:</span> {lastPemeriksaan.beratBadan} kg</p>
                      <p><span className="font-medium">Tinggi Badan:</span> {lastPemeriksaan.tinggiBadan} cm</p>
                      <p><span className="font-medium">Lingkar Kepala:</span> {lastPemeriksaan.lingkarKepala} cm</p>
                      <p><span className="font-medium">Imunisasi:</span> {lastPemeriksaan.imunisasi}</p>
                      <p><span className="font-medium">PMT:</span> {lastPemeriksaan.pmt ? lastPemeriksaan.jenisPmt : 'Tidak'}</p>
                      <p>
                        <span className="font-medium">Kategori Gizi:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-white ${getBadgeColor(lastGizi.kategoriGizi)} animate-pulse`}>
                          {lastGizi.kategoriGizi}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Status Stunting:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-white ${getBadgeColor(lastGizi.statusStunting)} animate-pulse`}>
                          {lastGizi.statusStunting}
                        </span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          <ChartCard title="Grafik KMS Berat Badan terhadap Usia (BB/U)" height="330px">
            <GrafikBBU />
          </ChartCard>

          <ChartCard title="Grafik KMS Tinggi Badan terhadap Usia (TB/U)" height="330px">
            <GrafikTBU />
          </ChartCard>

          <ChartCard title="Grafik KMS Berat Badan terhadap Tinggi Badan (BB/TB)" height="330px">
            <GrafikBBTB />
          </ChartCard>
        </div>
      )}
    </div>
  );
}
