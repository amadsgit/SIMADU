'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { MapPin, Home, Activity, BarChart3 } from 'lucide-react'; // ikon untuk tiap tab

export default function TabsPosyandu() {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Wilayah Kerja Puskesmas',
      href: '/dashboard/admin/manajemen-posyandu/wilayah-kerja',
      icon: Home,
    },
    {
      name: 'Data Posyandu',
      href: '/dashboard/admin/manajemen-posyandu/data-posyandu',
      icon: Activity,
    },
    {
      name: 'GIS Sebaran Posyandu',
      href: '/dashboard/admin/manajemen-posyandu/gis',
      icon: MapPin,
    },
    {
      name: 'Grafik Statistik Posyandu',
      href: '/dashboard/admin/manajemen-posyandu/statistik-posyandu',
      icon: BarChart3,
    },
  ];

  return (
    <div className="relative z-10 flex flex-wrap gap-2 border-b border-gray-200 mb-4 bg-white">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-medium text-sm transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                : 'bg-white text-emerald-700 border border-transparent hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800'
            )}
          >
            <Icon
              className={clsx(
                'w-4 h-4 transition-transform duration-200',
                isActive ? 'scale-110 text-white' : 'text-emerald-600'
              )}
            />
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
