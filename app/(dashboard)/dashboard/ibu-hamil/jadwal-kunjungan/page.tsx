'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

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

interface IbuHamil {
  id: number;
  nama: string;
  nik: string;
  tanggalLahir: string;
  tanggalHPHT: string | null;
  alamat: string;
  posyanduId: number;
  kaderId: number | null;
}

interface JadwalTerjadwalItem {
  id: number;
  kegiatan: {
    id: number;
    nama: string;
    deskripsi: string | null;
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
  posyanduId: number;
}

// ==============================
// FILTER FUNGSIONAL — agar kegiatan balita dll tidak muncul
// ==============================
const filterIbuHamilKegiatan = (nama: string) => {
  const n = nama.toLowerCase();
  return !(
    n.includes('balita') ||
    n.includes('bayi') ||
    n.includes('anak') ||
    n.includes('remaja') ||
    n.includes('stunting')
  );
};

// ==============================
// PAGE
// ==============================
export default function JadwalKunjunganIbuHamil() {
  const [ibuHamilList, setIbuHamilList] = useState<IbuHamil[]>([]);
  const [jadwalKegiatan, setJadwalKegiatan] = useState<JadwalTerjadwalItem[]>([]);
  const [jadwalMendatang, setJadwalMendatang] = useState<JadwalUpcomingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchJadwal();
  }, []);


  const fetchJadwal = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ibuhamil/jadwalkunjungan');
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || 'Gagal mengambil jadwal kunjungan');
        return;
      }

      // Simpan data
      setIbuHamilList(data.data.ibuHamil);

      // Pastikan kegiatan yang lolos hanya ibu hamil
      setJadwalKegiatan(
        data.data.jadwalKegiatan.filter((k: JadwalTerjadwalItem) =>
          filterIbuHamilKegiatan(k.kegiatan.nama)
        )
      );

      setJadwalMendatang(
        data.data.jadwalMendatang.filter((u: JadwalUpcomingItem) =>
          filterIbuHamilKegiatan(u.nama)
        )
      );
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  // Helper utk mencari posyandu & kader dari jadwalKegiatan
  const findPosyandu = (posyanduId: number) =>
    jadwalKegiatan.find(j => j.posyandu.id === posyanduId)?.posyandu;

  const findKader = (kaderId: number | null) =>
    jadwalKegiatan.find(j => j.kader.id === kaderId)?.kader;

  const hitungUsiaKehamilan = (tanggalHPHT: string) => {
    const hpht = new Date(tanggalHPHT);
    const now = new Date();

    const selisihMs = now.getTime() - hpht.getTime();
    const selisihHari = Math.floor(selisihMs / (1000 * 60 * 60 * 24));

    const minggu = Math.floor(selisihHari / 7);
    return minggu;
  };


  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">
        Jadwal <span className="text-pink-500">Kunjungan Ibu Hamil</span>
      </h2>
      <p className="text-gray-600 mb-8">
        Berikut adalah jadwal Posyandu untuk pemeriksaan kesehatan kehamilan anda.
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
      ) : ibuHamilList.length === 0 ? (
        <div className="text-center text-gray-500">Belum ada data ibu hamil.</div>
      ) : (
        <div className="space-y-6">
          {ibuHamilList.map((ibu, idx) => {
            const posyandu = findPosyandu(ibu.posyanduId);
            const kader = findKader(ibu.kaderId);

            const terjadwal = jadwalKegiatan.filter(
              j => j.posyandu.id === ibu.posyanduId
            );

            const upcoming = jadwalMendatang.filter(
              u => u.posyanduId === ibu.posyanduId
            );

            return (
              <motion.div
                key={ibu.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white border-l-4 border-pink-500 shadow-md rounded-xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                {/* ===== HEADER ===== */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">{ibu.nama}</h2>
                  <span className="text-gray-600 text-sm">
                    Usia Kehamilan:{' '}
                    {ibu.tanggalHPHT ? `${hitungUsiaKehamilan(ibu.tanggalHPHT)} minggu` : '-'}
                  </span>
                </div>

                {/* ===== POSYANDU ===== */}
                {posyandu && (
                  <>
                    <p>
                      <span className="font-medium">Posyandu:</span> {posyandu.nama}
                    </p>
                    <p>
                      <span className="font-medium">Alamat:</span> {posyandu.alamat},{' '}
                      {posyandu.kelurahan.nama}
                    </p>
                  </>
                )}

                {/* ===== KADER ===== */}
                {kader && (
                  <p>
                    <span className="font-medium">Kader Pendamping:</span> {kader.nama}
                  </p>
                )}

                {/* ===== UPCOMING ===== */}
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

                {/* ===== TERJADWAL (SELESAI) ===== */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2 text-pink-700">
                    Jadwal Pemeriksaan Selesai
                  </h3>

                  {terjadwal.length === 0 ? (
                    <p className="text-gray-500">Belum ada jadwal kegiatan.</p>
                  ) : (
                    <ul className="space-y-2">
                      {terjadwal.map(k => (
                        <li
                          key={k.id}
                          className="p-3 border rounded-lg hover:bg-pink-50 transition-colors"
                        >
                          <p className="font-medium">{k.kegiatan.nama}</p>

                          <p className="text-sm text-gray-700">
                            Tanggal:{' '}
                            {k.tanggalMulai
                              ? new Date(k.tanggalMulai).toLocaleDateString('id-ID')
                              : '-'}
                            {k.tanggalSelesai
                              ? ` s/d ${new Date(
                                  k.tanggalSelesai
                                ).toLocaleDateString('id-ID')}`
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
