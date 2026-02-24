
import {
  HomeIcon,
  UserGroupIcon,
  UserIcon,
  ClipboardDocumentIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  IdentificationIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { Layers3, HeartPulse } from 'lucide-react';

export type NavLink = {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const getFlatMenuByRole = (role: string): NavLink[] => {
  switch (role) {
    case 'admin':
      return [
        { name: 'Dashboard', href: '/dashboard/admin', icon: HomeIcon },
        { name: 'Manajemen Posyandu & Kader', href: '/dashboard/admin/manajemen-posyandu/wilayah-kerja', icon: UserGroupIcon },
        { name: 'Manajemen Klaster & Program Kesehatan', href: '/dashboard/admin/manajemen-program/klaster', icon: HeartPulse },
        { name: 'Manajemen Role & Akun', href: '/dashboard/admin/manajemen-akun/role', icon: UserIcon },
        { name: 'Laporan & Rekap Data Posyandu', href: '/dashboard/admin/laporan-posyandu/data-balita', icon: Layers3 }
      ];

    case 'pemegang_program_kia':
      return [
        { name: 'Dashboard', href: '/dashboard/pempro-kia', icon: HomeIcon },
        { name: 'Input jadwal kegiatan', href: '/dashboard/pempro-kia/jadwal-kegiatan', icon: ClipboardDocumentListIcon },
        { name: 'Monitoring & Laporan Kegiatan', href: '/dashboard/pempro-kia/monitoring', icon: ClipboardDocumentCheckIcon },
      ];

    case 'pemegang_program_imunisasi':
      return [
        { name: 'Dashboard', href: '/dashboard/pempro-imunisasi', icon: HomeIcon },
        { name: 'Input jadwal kegiatan', href: '/dashboard/pempro-imunisasi/jadwal-kegiatan', icon: ClipboardDocumentListIcon },
        { name: 'Monitoring & Laporan Kegiatan', href: '/dashboard/pempro-imunisasi/monitoring', icon: ClipboardDocumentCheckIcon },
      ];

    case 'pemegang_program_gizi':
      return [
        { name: 'Dashboard', href: '/dashboard/pempro-gizi', icon: HomeIcon },
        { name: 'Input jadwal kegiatan', href: '/dashboard/pempro-gizi/jadwal-kegiatan', icon: ClipboardDocumentListIcon },
        { name: 'Monitoring & Laporan Kegiatan', href: '/dashboard/pempro-gizi/monitoring', icon: ClipboardDocumentCheckIcon },
      ];

    case 'kader':
      return [
        { name: 'Dashboard', href: '/dashboard/kader', icon: HomeIcon },
        { name: 'Jadwal Kegiatan', href: '/dashboard/kader/kegiatan', icon: CalendarDaysIcon },
        { name: 'Input Data Balita', href: '/dashboard/kader/balita', icon: ClipboardDocumentIcon },
        { name: 'Input Data Ibu Hamil', href: '/dashboard/kader/ibu-hamil', icon: DocumentTextIcon },
        { name: 'Status Gizi Balita', href: '/dashboard/kader/status-gizi-balita', icon: IdentificationIcon },
        { name: 'Pemantauan Kehamilan', href: '/dashboard/kader/pemantauan-kehamilan', icon: ClipboardDocumentIcon },
        { name: 'Riwayat Kegiatan', href: '/dashboard/kader/riwayat-kegiatan', icon: ClipboardDocumentListIcon },
      ];

    case 'ibu_hamil':
      return [
        { name: 'Dashboard', href: `/dashboard/ibu-hamil`, icon: HomeIcon },
        { name: 'Jadwal Kunjungan Posyandu', href: '/dashboard/ibu-hamil/jadwal-kunjungan', icon: CalendarDaysIcon },
        { name: 'Catatan Ibu Hamil', href: '/dashboard/ibu-hamil/catatan', icon: ClipboardDocumentListIcon },
        // { name: 'Edukasi Kesehatan', href: '/dashboard/ibu-hamil/edukasi', icon: HeartPulse },
      ];

    case 'orang_tua_balita':
      return [
        { name: 'Dashboard', href: `/dashboard/orang-tua-balita`, icon: HomeIcon },
        { name: 'Jadwal Kunjungan Posyandu', href: '/dashboard/orang-tua-balita/jadwal-kunjungan', icon: CalendarDaysIcon },
        { name: 'Catatan Balita', href: '/dashboard/orang-tua-balita/catatan-anak', icon: ClipboardDocumentListIcon },
        // { name: 'Edukasi Gizi Anak', href: '/dashboard/orang-tua-balita/edukasi-anak', icon: HeartPulse }
      ];

    default:
      return [];
  }
};
