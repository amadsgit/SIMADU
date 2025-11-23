'use client';

import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  ClipboardListIcon,
  CheckCircle2Icon,
  Clock3Icon,
  EyeIcon,
} from 'lucide-react';
import Link from 'next/link';

// ============================
// INTERFACES
// ============================
interface ProgramKesehatan {
  id: number;
  nama: string;
}

interface Kegiatan {
  id: number;
  nama: string;
  programKesehatan: ProgramKesehatan;
}

interface Posyandu {
  id: number;
  nama: string;
  wilayah: string;
  kelurahan: { nama: string };
}

interface PemeriksaanBalita {
  id: number;
  balita: { id: number; nama: string; nik: string };
}

interface PemeriksaanIbuHamil {
  id: number;
  ibuHamil: { id: number; nama: string; nik: string };
}

interface PelaksanaanKegiatan {
  id: number;
  tanggalMulai: string;
  tanggalSelesai: string | null;
  status: string;
  jumlahBalita: number | null;
  jumlahIbuHamil: number | null;
  kegiatan: Kegiatan;
  posyandu: Posyandu;
  pemeriksaanBalita: PemeriksaanBalita[];
  pemeriksaanIbuHamil: PemeriksaanIbuHamil[];
}

interface Rekap {
  totalPelaksanaan: number;
  totalBalita: number;
  totalIbuHamil: number;
  namaPosyandu: string;
  wilayah: string;
  kelurahan: string;
  namaKader: string;
}

// ============================
// PAGE COMPONENT
// ============================
export default function RiwayatKegiatanPage() {
  const [rekap, setRekap] = useState<Rekap | null>(null);
  const [pelaksanaan, setPelaksanaan] = useState<PelaksanaanKegiatan[]>([]);
  const [loading, setLoading] = useState(true);

  // FILTER STATE
  const [searchQuery, setSearchQuery] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [program, setProgram] = useState('');
  const [status, setStatus] = useState('');

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/kader/riwayatKegiatan`);
        if (!res.ok) throw new Error('Gagal memuat data riwayat kegiatan');
        const data = await res.json();

        setRekap(data.rekap);
        setPelaksanaan(data.pelaksanaanKegiatan);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // FILTERING
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return pelaksanaan.filter((p) => {
      const matchNama =
        p.kegiatan.nama.toLowerCase().includes(q) ||
        p.kegiatan.programKesehatan.nama.toLowerCase().includes(q) ||
        p.posyandu.nama.toLowerCase().includes(q);
      const matchTanggalMulai = tanggalMulai
        ? new Date(p.tanggalMulai) >= new Date(tanggalMulai)
        : true;
      const matchTanggalSelesai = tanggalSelesai
        ? new Date(p.tanggalMulai) <= new Date(tanggalSelesai)
        : true;
      const matchProgram = program
        ? p.kegiatan.programKesehatan.nama
            .toLowerCase()
            .includes(program.toLowerCase())
        : true;
      const matchStatus = status
        ? p.status.toLowerCase() === status.toLowerCase()
        : true;
      return (
        matchNama &&
        matchTanggalMulai &&
        matchTanggalSelesai &&
        matchProgram &&
        matchStatus
      );
    });
  }, [pelaksanaan, searchQuery, tanggalMulai, tanggalSelesai, program, status]);

  // BADGE COLOR HELPER
  const getStatusBadge = (status: string) => {
    if (status === 'selesai') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
          <CheckCircle2Icon className="w-3 h-3" />
          Selesai
        </span>
      );
    } else if (status === 'berjalan') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200">
          <Clock3Icon className="w-3 h-3" />
          Berjalan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
        {status}
      </span>
    );
  };

  return (
    <div>
      <h2 className="text-lg font-semibold flex items-center gap-2 text-emerald-700 mb-3">
        <ClipboardListIcon className="w-5 h-5" />
        Riwayat Kegiatan Posyandu
      </h2>

      {/* HEADER INFO */}
      {rekap && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 text-sm text-gray-700">
          <p className="font-medium">
            {rekap.namaPosyandu} - {rekap.kelurahan}, {rekap.wilayah}
          </p>
          <p>Kader: {rekap.namaKader}</p>
          <p>Total Pelaksanaan: {rekap.totalPelaksanaan}</p>
        </div>
      )}

      {/* FILTER */}
      <div className="grid md:grid-cols-6 gap-2 mb-4">
        <input
          type="date"
          value={tanggalMulai}
          onChange={(e) => setTanggalMulai(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm"
        />
        <input
          type="date"
          value={tanggalSelesai}
          onChange={(e) => setTanggalSelesai(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm"
        />
        <input
          type="text"
          placeholder="Filter Program"
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm"
        >
          <option value="">Semua Status</option>
          <option value="berjalan">Berjalan</option>
          <option value="selesai">Selesai</option>
        </select>
        <input
          type="text"
          placeholder="Cari kegiatan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm col-span-2"
        />
      </div>

      {/* TABEL DATA */}
      <div className="overflow-x-auto border rounded-lg shadow-sm">
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
        ) : filteredData.length === 0 ? (
          <p className="p-4 text-gray-500 text-center">
            Tidak ada data kegiatan ditemukan.
          </p>
        ) : (
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-4 py-2 text-left">No</th>
                <th className="px-4 py-2 text-left">Tanggal</th>
                <th className="px-4 py-2 text-left">Nama Kegiatan</th>
                <th className="px-4 py-2 text-left">Program Kesehatan</th>
                <th className="px-4 py-2 text-left">Posyandu</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Balita</th>
                <th className="px-4 py-2 text-left">Ibu Hamil</th>
                <th className="px-4 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((p, i) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">
                    {new Date(p.tanggalMulai).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-2">{p.kegiatan.nama}</td>
                  <td className="px-4 py-2">
                    {p.kegiatan.programKesehatan.nama}
                  </td>
                  <td className="px-4 py-2">{p.posyandu.nama}</td>
                  <td className="px-4 py-2">{getStatusBadge(p.status)}</td>
                  <td className="px-4 py-2 text-emerald-700 font-semibold">
                    {p.jumlahBalita ?? p.pemeriksaanBalita.length}
                  </td>
                  <td className="px-4 py-2 text-rose-700 font-semibold">
                    {p.jumlahIbuHamil ?? p.pemeriksaanIbuHamil.length}
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/dashboard/kader/riwayat-kegiatan/${p.id}/rekap`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 border border-gray-200 rounded-md bg-white hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 text-gray-600 text-xs font-medium transition-all"
                    >
                      <EyeIcon className="h-4 w-4" />
                      Rekap Data
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
