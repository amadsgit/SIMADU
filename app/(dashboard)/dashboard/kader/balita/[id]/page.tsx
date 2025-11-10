import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Info, Baby, MapPin, Calendar, HeartPulse, Activity, History } from 'lucide-react';
import ButtonKembali from '@/components/button-kembali';

export default async function BalitaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) return notFound();

  const balita = await prisma.balita.findUnique({
    where: { id: numericId },
    include: {
      posyandu: {
        select: { nama: true, wilayah: true, kelurahan: true },
      },
      kader: {
        select: { nama: true },
      },
      pemeriksaanBalita: {
        orderBy: { tanggal: 'desc' }, // ambil pemeriksaan terbaru dulu
      },
      statusGizi: {
        orderBy: { tanggal: 'desc' }, // supaya array urut descending
      },
    },
  });

  if (!balita) return notFound();

  // Ambil statusGizi terbaru jika ada
  const latestStatusGizi = Array.isArray(balita.statusGizi) && balita.statusGizi.length > 0
    ? balita.statusGizi[0]
    : null;

  // Ambil pemeriksaan terbaru (jika ada) untuk menampilkan BB/TB saat ini
  const latestPemeriksaan = Array.isArray(balita.pemeriksaanBalita) && balita.pemeriksaanBalita.length > 0
    ? balita.pemeriksaanBalita[0]
    : null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Detail Data <span className="text-emerald-600">Balita</span></h2>
          <p className="text-gray-500 dark:text-gray-400">
            Informasi lengkap mengenai data balita terdaftar
          </p>
        </div>
        <Link href="/dashboard/kader/balita">
          <ButtonKembali />
        </Link>
      </div>

      {/* Konten */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identitas Balita */}
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
            <Baby className="w-5 h-5" /> Identitas Balita
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li><strong>Nama Balita:</strong> {balita.nama}</li>
            <li><strong>NIK:</strong> {balita.nik || '-'}</li>
            <li><strong>No KK:</strong> {balita.noKK || '-'}</li>
            <li><strong>Jenis Kelamin:</strong> {balita.jenisKelamin}</li>
            <li>
              <strong>Tanggal Lahir:</strong>{' '}
              {new Date(balita.tanggalLahir).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </li>
            <li><strong>Nama Ayah:</strong> {balita.namaAyah || '-'}</li>
            <li><strong>Nama Ibu:</strong> {balita.namaIbu || '-'}</li>
            <li><strong>Alamat:</strong> {balita.alamat || '-'}</li>
          </ul>
        </div>

        {/* Info Posyandu & Kader */}
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5" /> Lokasi Posyandu
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li><strong>Nama Posyandu:</strong> {balita.posyandu?.nama || '-'}</li>
            <li><strong>Wilayah:</strong> {balita.posyandu?.wilayah || '-'}</li>
            <li><strong>Kader Pencatat:</strong> {balita.kader?.nama || '-'}</li>
          </ul>
        </div>

        {/* Status Kesehatan */}
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
            <HeartPulse className="w-5 h-5" /> Status Gizi & Kesehatan
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li><strong>Berat Lahir:</strong> {balita.beratLahir ?? '-' } kg</li>
            <li><strong>Panjang Lahir:</strong> {balita.panjangLahir ?? '-'} cm</li>

            <li>
              <strong>Pemeriksaan Terakhir (BB/TB):</strong>{' '}
              {latestPemeriksaan
                ? `${latestPemeriksaan.beratBadan ?? '-'} kg / ${latestPemeriksaan.tinggiBadan ?? '-'} cm`
                : '-'}
            </li>

            <li>
              <strong>Status Gizi Terakhir:</strong>{' '}
              {/* {latestStatusGizi?.kategori ? (
                <span className="text-emerald-600 font-semibold">{latestStatusGizi.kategori}</span>
              ) : (
                '-'
              )} */}
            </li>
          </ul>
        </div>

        {/* Riwayat Pemeriksaan */}
        <div className="bg-white rounded-2xl shadow-md p-6 col-span-1 md:col-span-2 hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5" /> Riwayat Pemeriksaan
          </h2>
          {Array.isArray(balita.pemeriksaanBalita) && balita.pemeriksaanBalita.length > 0 ? (
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-emerald-50 text-emerald-700">
                <tr>
                  <th className="py-2 px-3 text-left">Tanggal</th>
                  <th className="py-2 px-3 text-left">BB (kg)</th>
                  <th className="py-2 px-3 text-left">TB (cm)</th>
                  <th className="py-2 px-3 text-left">Catatan / Keluhan</th>
                </tr>
              </thead>
              <tbody>
                {balita.pemeriksaanBalita.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-3">
                      {new Date(p.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-2 px-3">{p.beratBadan ?? '-'}</td>
                    <td className="py-2 px-3">{p.tinggiBadan ?? '-'}</td>
                    <td className="py-2 px-3">{p.catatan ?? p.keluhan ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 italic">Belum ada riwayat pemeriksaan.</p>
          )}
        </div>

        {/* Riwayat Pembuatan Data */}
        <div className="bg-white rounded-2xl shadow-md p-6 col-span-1 md:col-span-2 hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
            <History className="w-5 h-5" /> Riwayat Data
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li>
              <strong>Dibuat:</strong>{' '}
              {new Date(balita.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </li>
            <li>
              <strong>Terakhir Diperbarui:</strong>{' '}
              {new Date(balita.updatedAt).toLocaleDateString('id-ID', {
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
