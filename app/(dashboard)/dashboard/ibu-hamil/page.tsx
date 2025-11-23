'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function DashboardIbuHamil() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ibuhamil');
      const json = await res.json();

      if (res.ok && json.success) {
        setData(json.data);
      } else {
        toast.error(json.error || 'Gagal mengambil data');
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan server');
    } finally {
      setLoading(false);
    }
  };

  const calculateUmur = (tanggal: string) => {
    const lahir = new Date(tanggal);
    const now = new Date();

    let tahun = now.getFullYear() - lahir.getFullYear();
    let bulan = now.getMonth() - lahir.getMonth();

    if (bulan < 0) {
      tahun--;
      bulan += 12;
    }

    return `${tahun} tahun ${bulan} bulan`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">
        Dashboard <span className="text-pink-500">Ibu Hamil</span>
      </h1>
      <p className="text-gray-600 mb-8">
        Selamat datang 👋 Berikut adalah data pemantauan kehamilan anda.
      </p>

      {loading ? (
        <div className="flex justify-center items-center py-16 text-pink-600">
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
      ) : data.length === 0 ? (
        <div className="text-center text-gray-500">Belum ada data ibu hamil.</div>
      ) : (
        <div className="space-y-6">
          {data.map((ibu: any, idx: number) => {
            const lastPeriksa =
              ibu.pemeriksaanKehamilan[ibu.pemeriksaanKehamilan.length - 1];

            return (
              <motion.div
                key={ibu.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white border-l-4 border-pink-500 shadow-md rounded-xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                {/* =========================
                    HEADER IBU HAMIL
                ========================== */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {ibu.nama}
                  </h2>

                  <div className="text-gray-600 text-sm text-left md:text-right">
                    <p>Umur: {calculateUmur(ibu.tanggalLahir)}</p>
                    <p>
                      HPHT:{' '}
                      {new Date(ibu.tanggalHPHT).toLocaleDateString('id-ID')}
                    </p>
                    <p>
                      HPL:{' '}
                      {new Date(ibu.tanggalHPL).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* =========================
                    DETAIL IBU HAMIL
                ========================== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <p><span className="font-medium">NIK:</span> {ibu.nik}</p>
                    <p><span className="font-medium">No KK:</span> {ibu.noKK}</p>
                    <p><span className="font-medium">Alamat:</span> {ibu.alamat}</p>
                    <p><span className="font-medium">Nama Suami:</span> {ibu.namaSuami}</p>
                    <p><span className="font-medium">HP Suami:</span> {ibu.HPSuami}</p>
                  </div>

                  <div className="space-y-1">
                    <p><span className="font-medium">Posyandu:</span> {ibu.posyandu.nama}</p>
                    <p><span className="font-medium">Wilayah:</span> {ibu.posyandu.wilayah}</p>
                    <p><span className="font-medium">Kelurahan:</span> {ibu.posyandu.kelurahan.nama}</p>
                    <p><span className="font-medium">Kader:</span> {ibu.kader.nama}</p>
                  </div>
                </div>

                {/* =========================
                    STATUS IBU HAMIL
                ========================== */}
                <div className="bg-pink-50 p-4 rounded-lg shadow-inner mb-4">
                  <h3 className="text-lg font-semibold text-pink-700 mb-2">
                    Status Ibu Hamil
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <p><span className="font-medium">BB Sebelum Hamil:</span> {ibu.BBSH} kg</p>
                    <p><span className="font-medium">TB Sebelum Hamil:</span> {ibu.TBSH} cm</p>
                    <p><span className="font-medium">LiLA:</span> {ibu.liLA} cm</p>
                    <p><span className="font-medium">Status KEK:</span> {ibu.StatusGiziKEK}</p>
                  </div>
                </div>

                {/* =========================
                    PEMERIKSAAN TERAKHIR
                ========================== */}
                {lastPeriksa && (
                  <div className="bg-white p-4 rounded-lg shadow-inner border border-pink-200">
                    <h3 className="text-lg font-semibold text-pink-700 mb-2">
                      Pemeriksaan Terakhir
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-gray-700">
                      <p><span className="font-medium">Tanggal:</span> {new Date(lastPeriksa.tanggal).toLocaleDateString('id-ID')}</p>
                      <p><span className="font-medium">Usia Kehamilan:</span> {lastPeriksa.usiaKehamilan} minggu</p>
                      <p><span className="font-medium">Berat Badan:</span> {lastPeriksa.beratBadan} kg</p>
                      <p><span className="font-medium">Tekanan Darah:</span> {lastPeriksa.tekananDarah}</p>
                      <p><span className="font-medium">TFU:</span> {lastPeriksa.tinggiFundus} cm</p>
                      <p><span className="font-medium">DJJ:</span> {lastPeriksa.detakJantungJanin} bpm</p>
                      <p><span className="font-medium">Pemberian Fe:</span> {lastPeriksa.pemberianFe ? 'Ya' : 'Tidak'}</p>
                      <p><span className="font-medium">PMT:</span> {lastPeriksa.pmt ? lastPeriksa.jenisPmt : 'Tidak'}</p>
                    </div>

                    <div className="mt-3">
                      <p><span className="font-medium">Keluhan:</span> {lastPeriksa.keluhan || '-'}</p>
                      <p><span className="font-medium">Tindakan:</span> {lastPeriksa.tindakan || '-'}</p>
                      <p><span className="font-medium">Konseling:</span> {lastPeriksa.konseling || '-'}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
