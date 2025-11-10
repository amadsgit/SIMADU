import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  Info,
  Baby,
  MapPin,
  Calendar,
  HeartPulse,
  Activity,
  History,
  User2,
} from 'lucide-react';
import ButtonKembali from '@/components/button-kembali';

export default async function IbuHamilDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) return notFound();

  const ibuHamil = await prisma.ibuHamil.findUnique({
    where: { id: numericId },
    include: {
      posyandu: {
        select: { nama: true, wilayah: true },
      },
      kader: {
        select: { nama: true },
      },
      pemeriksaanKehamilan: {
        orderBy: { tanggal: 'desc' },
      },
    },
  });

  if (!ibuHamil) return notFound();

  const latestPemeriksaan =
    ibuHamil.pemeriksaanKehamilan.length > 0
      ? ibuHamil.pemeriksaanKehamilan[0]
      : null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Detail Data <span className="text-pink-600">Ibu Hamil</span></h2>
          <p className="text-gray-500 dark:text-gray-400">
            Informasi lengkap mengenai data ibu hamil terdaftar
          </p>
        </div>
        <Link href="/dashboard/kader/ibu-hamil">
          <ButtonKembali />
        </Link>
      </div>

      {/* Konten */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identitas Ibu Hamil */}
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
            <User2 className="w-5 h-5" /> Identitas Ibu Hamil
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li><strong>Nama Ibu:</strong> {ibuHamil.nama}</li>
            <li><strong>NIK:</strong> {ibuHamil.nik}</li>
            <li><strong>No KK:</strong> {ibuHamil.noKK}</li>
            <li>
              <strong>Tanggal Lahir:</strong>{' '}
              {new Date(ibuHamil.tanggalLahir).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </li>
            <li><strong>Alamat:</strong> {ibuHamil.alamat}</li>
          </ul>
        </div>

        {/* Info Posyandu & Kader */}
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5" /> Lokasi Posyandu
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li><strong>Nama Posyandu:</strong> {ibuHamil.posyandu?.nama || '-'}</li>
            <li><strong>Wilayah:</strong> {ibuHamil.posyandu?.wilayah || '-'}</li>
            <li><strong>Kader Pencatat:</strong> {ibuHamil.kader?.nama || '-'}</li>
          </ul>
        </div>

        {/* Status Kehamilan */}
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
            <HeartPulse className="w-5 h-5" /> Status Kehamilan
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li>
              <strong>Umur Kehamilan Awal:</strong>{' '}
              {ibuHamil.umurKehamilanAwal
                ? `${ibuHamil.umurKehamilanAwal} minggu`
                : '-'}
            </li>
            <li>
              <strong>HPHT:</strong>{' '}
              {ibuHamil.tanggalHPHT
                ? new Date(ibuHamil.tanggalHPHT).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '-'}
            </li>
            <li>
              <strong>HPL:</strong>{' '}
              {ibuHamil.tanggalHPL
                ? new Date(ibuHamil.tanggalHPL).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '-'}
            </li>
            <li><strong>Gravida:</strong> {ibuHamil.gravida ?? '-'}</li>
            <li><strong>Para:</strong> {ibuHamil.para ?? '-'}</li>
            <li><strong>Abortus:</strong> {ibuHamil.abortus ?? '-'}</li>
          </ul>
        </div>

        {/* Pemeriksaan Terakhir */}
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5" /> Pemeriksaan Terakhir
          </h2>
          {latestPemeriksaan ? (
            <ul className="space-y-3 text-gray-600">
              <li>
                <strong>Tanggal Pemeriksaan:</strong>{' '}
                {new Date(latestPemeriksaan.tanggal).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </li>
              <li><strong>Berat Badan:</strong> {latestPemeriksaan.beratBadan ?? '-'} kg</li>
              <li><strong>Tinggi Fundus:</strong> {latestPemeriksaan.tinggiFundus ?? '-'} cm</li>
              <li><strong>Tekanan Darah:</strong> {latestPemeriksaan.tekananDarah ?? '-'}</li>
              {/* <li><strong>Catatan:</strong> {latestPemeriksaan.catatan ?? '-'}</li> */}
            </ul>
          ) : (
            <p className="text-gray-500 italic">Belum ada pemeriksaan kehamilan.</p>
          )}
        </div>

        {/* Riwayat Pemeriksaan */}
        <div className="bg-white rounded-2xl shadow-md p-6 col-span-1 md:col-span-2 hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
            <History className="w-5 h-5" /> Riwayat Pemeriksaan Kehamilan
          </h2>
          {ibuHamil.pemeriksaanKehamilan.length > 0 ? (
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-emerald-50 text-emerald-700">
                <tr>
                  <th className="py-2 px-3 text-left">Tanggal</th>
                  <th className="py-2 px-3 text-left">Berat Badan (kg)</th>
                  <th className="py-2 px-3 text-left">Tinggi Fundus (cm)</th>
                  <th className="py-2 px-3 text-left">Tekanan Darah</th>
                  {/* <th className="py-2 px-3 text-left">Catatan / Keluhan</th> */}
                </tr>
              </thead>
              <tbody>
                {ibuHamil.pemeriksaanKehamilan.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-3">
                      {new Date(p.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-2 px-3">{p.beratBadan ?? '-'}</td>
                    <td className="py-2 px-3">{p.tinggiFundus ?? '-'}</td>
                    <td className="py-2 px-3">{p.tekananDarah ?? '-'}</td>
                    {/* <td className="py-2 px-3">{p.catatan ?? '-'}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 italic">Belum ada riwayat pemeriksaan.</p>
          )}
        </div>

        {/* Riwayat Data */}
        <div className="bg-white rounded-2xl shadow-md p-6 col-span-1 md:col-span-2 hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5" /> Riwayat Data
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li>
              <strong>Dibuat:</strong>{' '}
              {new Date(ibuHamil.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </li>
            <li>
              <strong>Terakhir Diperbarui:</strong>{' '}
              {new Date(ibuHamil.updatedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
