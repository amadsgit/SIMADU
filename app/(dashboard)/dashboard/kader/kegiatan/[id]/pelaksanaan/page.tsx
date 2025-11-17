'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import {
  ClockIcon,
  MapPinIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import TabsPane from '@/components/tab-pane-kegiatan';

// Lazy import
const FormBalita = dynamic(() => import('@/components/pemeriksaan/balita'), { ssr: false });
const FormIbuHamil = dynamic(() => import('@/components/pemeriksaan/ibuHamil'), { ssr: false });

interface Kegiatan {
  id: number;
  nama: string;
  posyandu: {
    id: number;
    nama: string;
    wilayah: string;
    kelurahan: { id: number; nama: string };
  };
  programKesehatan?: { id: number; nama: string };
}

interface Pelaksanaan {
  id: number;
  status: string;
  tanggalMulai: string;
  tanggalSelesai?: string;
  catatanUmum?: string;
}

interface Balita { id: number; nama: string; nik: string; }
interface IbuHamil { id: number; nama: string; nik: string; }

export default function PelaksanaanPage() {
  const { id } = useParams();
  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(null);
  const [pelaksanaan, setPelaksanaan] = useState<Pelaksanaan | null>(null);
  const [daftarBalita, setDaftarBalita] = useState<Balita[]>([]);
  const [daftarIbuHamil, setDaftarIbuHamil] = useState<IbuHamil[]>([]);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);

  // FETCH DATA UTAMA
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/kader/kegiatan/${id}/pelaksanaan`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengambil data');
      setKegiatan(data.kegiatan);
      setPelaksanaan(data.pelaksanaan);

      // auto tampilkan form jika berjalan
      if (data.pelaksanaan?.status === 'berjalan') {
        setShowDropdown(true);
        const savedForm = localStorage.getItem(`selectedForm_${id}`);
        if (savedForm) setSelectedForm(savedForm);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

   const fetchPeserta = async () => {
    try {
      const res = await fetch(`/api/kader/kegiatan/${id}/pelaksanaan/pemeriksaan`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengambil daftar peserta');

      setDaftarBalita(data.peserta?.balita ?? []);
      setDaftarIbuHamil(data.peserta?.ibuHamil ?? []);
    } catch (err: any) {
      toast.error('Tidak bisa memuat daftar peserta');
      setDaftarBalita([]);
      setDaftarIbuHamil([]);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
      fetchPeserta();
    }
  }, [id]);

  // HANDLER
  const handleMulai = async () => {
    try {
      toast.loading('Memulai pelaksanaan...');
      const res = await fetch(`/api/kader/kegiatan/${id}/pelaksanaan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      toast.dismiss();
      if (!res.ok) throw new Error(data.error || 'Gagal memulai pelaksanaan');
      setPelaksanaan(data);
      setShowDropdown(true);
      toast.success('Pelaksanaan dimulai');
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message);
    }
  };

  const handleSelesai = async () => {
    try {
      setFinishing(true);
      toast.loading('Menyelesaikan kegiatan...');
      const res = await fetch(`/api/kader/kegiatan/${id}/pelaksanaan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catatanUmum: 'Pelaksanaan selesai dengan baik.' }),
      });
      const data = await res.json();
      toast.dismiss();
      if (!res.ok) throw new Error(data.error || 'Gagal menyelesaikan kegiatan');
      toast.success('Pelaksanaan telah selesai');

      // Hapus simpanan form di localStorage saat kegiatan selesai
      localStorage.removeItem(`selectedForm_${id}`);

      fetchData();
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message);
    } finally {
      setFinishing(false);
    }
  };

  // FORM SELECT
  const handleSelectChange = (value: string) => {
    setSelectedForm(value);
    localStorage.setItem(`selectedForm_${id}`, value);
  };

  // BADGE
  const getBadgeColor = (status?: string) => {
    switch (status) {
      case 'berjalan':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'selesai':
        return 'bg-green-100 text-green-700 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  // RENDER
  if (loading)
    return <p className="p-4 text-gray-500 text-center">Memuat data...</p>;

  if (!kegiatan)
    return <p className="p-4 text-red-500 text-center">Kegiatan tidak ditemukan.</p>;

  return (
    <div className="p-2">
      <TabsPane />
      <div className="max-w-full mx-auto bg-green-50 border border-green-200 shadow-sm hover:shadow-md transition rounded-xl p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold">{kegiatan.nama}</h2>
            {pelaksanaan && (
              <span
                className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full ${getBadgeColor(pelaksanaan.status)}`}
              >
                {pelaksanaan.status?.toUpperCase()}
              </span>
            )}
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center gap-2">
            {(!pelaksanaan || pelaksanaan?.status === 'belum_mulai') && (
              <button
                onClick={handleMulai}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition shadow-sm"
              >
                Mulai Pelaksanaan
              </button>
            )}
            {pelaksanaan?.status === 'berjalan' && (
              <button
                onClick={() => {
                  if (window.confirm('Yakin ingin menyelesaikan kegiatan ini?')) {
                    handleSelesai();
                  }
                }}
                disabled={finishing}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-white transition shadow-sm ${
                  finishing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {finishing ? 'Menyelesaikan...' : 'Selesaikan'}
              </button>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <ClipboardDocumentCheckIcon className="w-4 h-4 text-emerald-600 mt-0.5" />
            <div>
              <span className="font-semibold">Program:</span>
              <p className="text-gray-600">{kegiatan.programKesehatan?.nama || '-'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPinIcon className="w-4 h-4 text-emerald-600 mt-0.5" />
            <div>
              <span className="font-semibold">Posyandu:</span>
              <p className="text-gray-600">
                {kegiatan.posyandu?.nama} — {kegiatan.posyandu?.wilayah},{' '}
                {kegiatan.posyandu.kelurahan.nama}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <ClockIcon className="w-4 h-4 text-emerald-600 mt-0.5" />
            <div>
              <span className="font-semibold">Waktu:</span>
              {pelaksanaan ? (
                <>
                  <p className="text-gray-600">
                    Mulai: {new Date(pelaksanaan.tanggalMulai).toLocaleString('id-ID')}
                  </p>
                  {pelaksanaan.tanggalSelesai && (
                    <p className="text-gray-600">
                      Selesai: {new Date(pelaksanaan.tanggalSelesai).toLocaleString('id-ID')}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Belum dimulai</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TabsPane muncul hanya jika pelaksanaan berjalan */}
      {showDropdown && (
        <div className="mt-2 max-w-full mx-auto bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Pilih Jenis Pelayanan Posyandu
          </label>
          <select
            value={selectedForm || ''}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">-- Pilih Jenis --</option>
            <option value="balita">Pemeriksaan Balita</option>
            <option value="ibuHamil">Pemeriksaan Ibu Hamil</option>
          </select>
        </div>
      )}

      <div className="mt-4">
        {selectedForm === 'balita' && (
          <FormBalita
            kegiatanId={Number(id)}
            pelaksanaanKegiatanId={pelaksanaan?.id || null}
            daftarBalita={daftarBalita}
          />
        )}

        {selectedForm === 'ibuHamil' && (
          <FormIbuHamil
            kegiatanId={Number(id)}
            pelaksanaanKegiatanId={pelaksanaan?.id || null}
            daftarIbuHamil={daftarIbuHamil}
          />
        )}
      </div>
    </div>
  );
}
