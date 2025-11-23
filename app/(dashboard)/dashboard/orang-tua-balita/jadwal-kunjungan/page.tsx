'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

/* ============================
   INTERFACE -> Sesuai API
=============================*/

interface Kelurahan {
  id: number;
  nama: string;
}

interface Posyandu {
  id: number;
  nama: string;
  alamat: string;
  wilayah: string;
  kelurahan: Kelurahan;
}

interface Kader {
  id: number;
  nama: string;
}

interface Balita {
  id: number;
  nama: string;
  tanggalLahir: string;
  jenisKelamin: string;
  alamat: string;
  posyanduId: number;
  kaderId: number;
}

interface JadwalTerjadwalItem {
  id: number;
  kegiatan: {
    id: number;
    nama: string;
    deskripsi: string | null;
    tanggalPelaksanaan?: string;
  };
  posyandu: Posyandu;
  kader: Kader;
  tanggalMulai: string | null;
  tanggalSelesai: string | null;
  status: string;
}

interface JadwalUpcomingItem {
  id: number;
  nama: string;
  deskripsi: string | null;
  tanggalPelaksanaan: string;
  alamat: string;
  posyanduId: number;
}

export default function JadwalKunjungan() {
  const [balitaList, setBalitaList] = useState<Balita[]>([]);
  const [jadwalKegiatan, setJadwalKegiatan] = useState<JadwalTerjadwalItem[]>([]);
  const [jadwalMendatang, setJadwalMendatang] = useState<JadwalUpcomingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchJadwal();
  }, []);

  const fetchJadwal = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ortubalita/jadwalkunjungan');
      const data = await res.json();

      if (res.ok && data.success) {
        setBalitaList(data.data.balita);
        setJadwalKegiatan(data.data.jadwalKegiatan);
        setJadwalMendatang(data.data.jadwalMendatang);
      } else {
        toast.error(data.error || 'Gagal mengambil jadwal kunjungan');
      }
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

  const findPosyandu = (posyanduId: number) =>
    jadwalKegiatan.find(j => j.posyandu.id === posyanduId)?.posyandu;

  const findKader = (kaderId: number) =>
    jadwalKegiatan.find(j => j.kader.id === kaderId)?.kader;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">
        Jadwal <span className="text-emerald-500">Kunjungan Posyandu</span>
      </h2>
      <p className="text-gray-600 mb-8">
        Berikut adalah jadwal kegiatan Posyandu Anak Anda.
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
        <div className="text-center text-gray-500">
          Belum ada data balita.
        </div>
      ) : (
        <div className="space-y-6">
          {balitaList.map((balita, idx) => {
            const posyandu = findPosyandu(balita.posyanduId);
            const kader = findKader(balita.kaderId);

            // filter jadwal terjadwal per posyandu
            const terjadwal = jadwalKegiatan.filter(
              j => j.posyandu.id === balita.posyanduId
            );

            // filter jadwal mendatang per posyandu
            const upcoming = jadwalMendatang.filter(
              u => u.posyanduId === balita.posyanduId
            );

            return (
              <motion.div
                key={balita.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white border-l-4 border-emerald-500 shadow-md rounded-xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                {/* Header Balita */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {balita.nama} ({balita.jenisKelamin})
                  </h2>
                  <span className="text-gray-600 text-sm">
                    Umur: {calculateAge(balita.tanggalLahir)}
                  </span>
                </div>

                {/* Info Posyandu */}
                {posyandu && (
                  <>
                    <p>
                      <span className="font-medium">Posyandu:</span> {posyandu.nama}
                    </p>
                    <p>
                      <span className="font-medium">Alamat:</span> {posyandu.alamat}, {posyandu.kelurahan.nama}
                    </p>
                  </>
                )}

                {/* Kader */}
                {kader && (
                  <p>
                    <span className="font-medium">Kader Penanggung Jawab:</span>{' '}
                    {kader.nama}
                  </p>
                )}

                                {/* === BAGIAN JADWAL MENDATANG === */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2 text-blue-600">
                    Jadwal Mendatang
                  </h3>

                  {upcoming.length === 0 ? (
                    <p className="text-gray-500">Belum ada kegiatan mendatang.</p>
                  ) : (
                    <ul className="space-y-2">
                      {upcoming.map(u => (
                        <li
                          key={u.id}
                          className="p-3 border rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <p className="font-medium">{u.nama}</p>
                          {u.deskripsi && (
                            <p className="text-sm text-gray-600">{u.deskripsi}</p>
                          )}
                          <p className="text-sm text-gray-700">
                            Tanggal:{' '}
                            {new Date(u.tanggalPelaksanaan).toLocaleDateString('id-ID')}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* === BAGIAN JADWAL TERJADWAL === */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2 text-emerald-700">
                    Jadwal Kegiatan Selesai
                  </h3>

                  {terjadwal.length === 0 ? (
                    <p className="text-gray-500">Belum ada jadwal kegiatan.</p>
                  ) : (
                    <ul className="space-y-2">
                      {terjadwal.map(k => (
                        <li
                          key={k.id}
                          className="p-3 border rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                          <p className="font-medium">{k.kegiatan.nama}</p>
                          {k.kegiatan.deskripsi && (
                            <p className="text-sm text-gray-600">{k.kegiatan.deskripsi}</p>
                          )}
                          <p className="text-sm text-gray-700">
                            Tanggal:{' '}
                            {k.tanggalMulai
                              ? new Date(k.tanggalMulai).toLocaleDateString('id-ID')
                              : '-'}
                            {k.tanggalSelesai
                              ? ` s/d ${new Date(k.tanggalSelesai).toLocaleDateString('id-ID')}`
                              : ''}
                          </p>
                          <p className="text-sm text-gray-700">Kader: {k.kader.nama}</p>
                          <p className="text-sm text-gray-700">Status: {k.status}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
