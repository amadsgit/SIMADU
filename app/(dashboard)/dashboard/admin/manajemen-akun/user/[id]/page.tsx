import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Info, Phone, MapPin, Calendar, History, ShieldCheck } from 'lucide-react';
import ButtonKembali from '@/components/button-kembali';

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      role: {
        select: { id: true, nama: true },
      },
    },
  });

  if (!user) return notFound();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Detail User</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Informasi lengkap mengenai data user terdaftar
          </p>
        </div>
        <Link href="/dashboard/admin/manajemen-akun/user">
          <ButtonKembali />
        </Link>
      </div>

      {/* Konten */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informasi Pribadi */}
        <div className="bg-white dark:bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
            <Info className="w-5 h-5" /> Informasi Pribadi
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li><strong>Nama Lengkap:</strong> {user.nama}</li>
            <li><strong>Email:</strong> {user.email}</li>
            <li><strong>Role:</strong> {user.role?.nama || '-'}</li>
            <li><strong>Tanggal Lahir:</strong>{' '}
              {new Date(user.tanggalLahir).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </li>
          </ul>
        </div>

        {/* Kontak & Identitas */}
        <div className="bg-white dark:bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5" /> Kontak & Identitas
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li><strong>No HP:</strong> {user.noHp}</li>
            <li><strong>NIK:</strong> {user.nik}</li>
            <li><strong>No KK:</strong> {user.noKK || '-'}</li>
            <li><strong>Alamat:</strong> {user.alamat}</li>
          </ul>
        </div>

        {/* Status & Verifikasi */}
        <div className="bg-white dark:bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5" /> Status & Verifikasi
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li>
              <strong>Status Akun:</strong>{' '}
              {user.verifiedAt ? (
                <span className="text-emerald-600 font-semibold">Terverifikasi</span>
              ) : (
                <span className="text-red-500 font-semibold">Belum Terverifikasi</span>
              )}
            </li>
            <li>
              <strong>Tanggal Verifikasi:</strong>{' '}
              {user.verifiedAt
                ? new Date(user.verifiedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '-'}
            </li>
            <li><strong>Reset Token:</strong> {user.resetToken || '-'}</li>
          </ul>
        </div>

        {/* Riwayat Pembuatan */}
        <div className="bg-white dark:bg-white rounded-2xl shadow-md p-6 col-span-1 md:col-span-2 hover:shadow-lg transition-all duration-200">
          <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
            <History className="w-5 h-5" /> Riwayat Akun
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li>
              <strong>Dibuat:</strong>{' '}
              {new Date(user.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </li>
            <li>
              <strong>Terakhir Diperbarui:</strong>{' '}
              {new Date(user.updatedAt).toLocaleDateString('id-ID', {
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
