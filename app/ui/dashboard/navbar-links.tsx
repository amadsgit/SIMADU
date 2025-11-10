
import {
  HomeIcon,
  UserGroupIcon,
  UserIcon,
  ClipboardDocumentIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  IdentificationIcon,
  DocumentTextIcon,
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
        { name: 'Home', href: '/dashboard/admin', icon: HomeIcon },
        { name: 'Manajemen Posyandu & Kader', href: '/dashboard/admin/manajemen-posyandu/wilayah-kerja', icon: UserGroupIcon },
        { name: 'Manajemen User', href: '/dashboard/admin/manajemen-akun/role', icon: UserIcon },
        { name: 'Manajemen Program', href: '/dashboard/admin/manajemen-program/klaster', icon: HeartPulse },
        { name: 'Monitoring Posyandu', href: '/dashboard/admin/monitoring', icon: Layers3 }
      ];

    case 'pemegang_program_kia':
      return [
        { name: 'Home', href: '/dashboard/pempro-kia', icon: HomeIcon },
        { name: 'Input jadwal kegiatan', href: '/dashboard/pempro-kia/jadwal-kegiatan', icon: UserGroupIcon },
        { name: 'Monitoring & Laporan', href: '/dashboard/pempro-kia/laporan', icon: UserIcon },
        { name: 'Rekap Data Lapangan', href: '/dashboard/pempro-kia/data-lapangan', icon: ClipboardDocumentListIcon }
      ];

    case 'pemegang_program_imunisasi':
      return [
        { name: 'Home', href: '/dashboard/pempro-imunisasi', icon: HomeIcon },
        { name: 'Input jadwal kegiatan', href: '/dashboard/pempro-imunisasi/jadwal-kegiatan', icon: UserGroupIcon },
        { name: 'Monitoring & Laporan', href: '/dashboard/pempro-imunisasi/laporan', icon: UserIcon },
        { name: 'Rekap Data Lapangan', href: '/dashboard/pempro-imunisasi/data-lapangan', icon: ClipboardDocumentListIcon }
      ];

    case 'pemegang_program_gizi':
      return [
        { name: 'Home', href: '/dashboard/pempro-gizi', icon: HomeIcon },
        { name: 'Input jadwal kegiatan', href: '/dashboard/pempro-gizi/jadwal-kegiatan', icon: UserGroupIcon },
        { name: 'Monitoring & Laporan', href: '/dashboard/pempro-gizi/laporan', icon: UserIcon },
        { name: 'Rekap Data Lapangan', href: '/dashboard/pempro-gizi/data-lapangan', icon: ClipboardDocumentListIcon }
      ];

    case 'kader':
      return [
        { name: 'Home', href: '/dashboard/kader', icon: HomeIcon },
        { name: 'Jadwal Kegiatan', href: '/dashboard/kader/jadwal-kegiatan', icon: CalendarDaysIcon },
        { name: 'Input Data Balita', href: '/dashboard/kader/balita', icon: ClipboardDocumentIcon },
        { name: 'Status Gizi Balita', href: '/dashboard/kader/status-gizi', icon: IdentificationIcon },
        { name: 'Input Data Ibu Hamil', href: '/dashboard/kader/ibu-hamil', icon: DocumentTextIcon },
        { name: 'Pemantauan Kehamilan', href: '/dashboard/kader/pemantauan-kehamilan', icon: ClipboardDocumentIcon },
        { name: 'Riwayat Input', href: '/dashboard/kader/riwayat', icon: ClipboardDocumentListIcon },
        { name: 'Rekap Kehadiran Balita', href: '/dashboard/kader/kehadiran-balita', icon: ClipboardDocumentListIcon },
        { name: 'Rekap Kehadiran Bumil', href: '/dashboard/kader/kehadiran-bumil', icon: ClipboardDocumentListIcon },
      ];

    case 'ibu_hamil':
      return [
        { name: 'Home', href: `/dashboard/ibu-hamil`, icon: HomeIcon },
        { name: 'Jadwal Kunjungan Posyandu', href: '/dashboard/ibu-hamil/jadwal-kunjungan', icon: CalendarDaysIcon },
        { name: 'Catatan Ibu Hamil', href: '/dashboard/ibu-hamil/catatan', icon: ClipboardDocumentListIcon },
        { name: 'Edukasi Kesehatan', href: '/dashboard/ibu-hamil/edukasi', icon: HeartPulse },
      ];

    case 'orang_tua_balita':
      return [
        { name: 'Home', href: `/dashboard/orang-tua-balita`, icon: HomeIcon },
        { name: 'Jadwal Kunjungan Posyandu', href: '/dashboard/jadwal-kunjungan', icon: CalendarDaysIcon },
        { name: 'Catatan Balita', href: '/dashboard/catatan-anak', icon: ClipboardDocumentListIcon },
        { name: 'Edukasi Gizi Anak', href: '/dashboard/edukasi-anak', icon: HeartPulse }
      ];

    default:
      return [];
  }
};
