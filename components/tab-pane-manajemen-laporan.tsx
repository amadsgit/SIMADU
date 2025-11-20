'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  Baby,
  User2,
  Stethoscope,
  HeartPulse,
} from "lucide-react";

export default function TabsUser() {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Data Balita",
      href: "/dashboard/admin/laporan-posyandu/data-balita",
      icon: Baby,
    },
    {
      name: "Data Ibu Hamil",
      href: "/dashboard/admin/laporan-posyandu/data-ibuhamil",
      icon: User2,
    },
    {
      name: "Data Pemeriksaan Balita",
      href: "/dashboard/admin/laporan-posyandu/data-balita/pemeriksaan",
      icon: Stethoscope,
    },
    {
      name: "Data Pemeriksaan Ibu Hamil",
      href: "/dashboard/admin/laporan-posyandu/data-ibuhamil/pemeriksaan",
      icon: HeartPulse,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-3">
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
            <Icon className="w-4 h-4" />
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
