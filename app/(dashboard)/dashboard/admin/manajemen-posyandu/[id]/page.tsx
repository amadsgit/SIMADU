import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Info, Phone, History, MapPin } from 'lucide-react';
import ButtonKembali from '@/components/button-kembali';

export default async function PosyanduDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);

  const posyandu = await prisma.posyandu.findUnique({
    where: { id: numericId },
    include: { kelurahan: true },
  });

  if (!posyandu) return notFound();

  return (
    <div className="max-w-full mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Detail Posyandu</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Informasi lengkap tentang posyandu yang terdaftar
          </p>
        </div>
        <Link href="/dashboard/admin/manajemen-posyandu/data-posyandu">
          <ButtonKembali />
        </Link>
      </div>

      {/* Konten */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informasi Umum */}
        <div className="bg-white dark:bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
            <Info className="w-5 h-5" /> Informasi Umum
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li><strong>Nama:</strong> {posyandu.nama}</li>
            <li><strong>Alamat:</strong> {posyandu.alamat}</li>
            <li><strong>Wilayah:</strong> {posyandu.wilayah}</li>
            <li><strong>Kelurahan:</strong> {posyandu.kelurahan?.nama || '-'}</li>
            <li><strong>Akreditasi:</strong> {posyandu.akreditasi}</li>
          </ul>
        </div>

        {/* Kontak & Koordinat */}
        <div className="bg-white dark:white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5" /> Kontak & Koordinat
          </h2>
          <ul className="space-y-3 text-gray-600 ">
            <li><strong>Penanggung Jawab:</strong> {posyandu.penanggungJawab}</li>
            <li><strong>No HP:</strong> {posyandu.noHp}</li>
            <li><strong>Latitude:</strong> {posyandu.latitude}</li>
            <li><strong>Longitude:</strong> {posyandu.longitude}</li>
          </ul>
        </div>

        {/* Riwayat */}
        <div className="bg-white dark:white rounded-2xl shadow-md p-6 col-span-1 md:col-span-2 hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
            <History className="w-5 h-5" /> Riwayat Pencatatan
          </h2>
          <ul className="space-y-3 text-gray-600 ">
            <li>
              <strong>Dibuat:</strong>{' '}
              {new Date(posyandu.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </li>
            <li>
              <strong>Diupdate:</strong>{' '}
              {new Date(posyandu.updatedAt).toLocaleDateString('id-ID', {
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
