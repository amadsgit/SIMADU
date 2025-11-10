'use client';

import Link from 'next/link';
import {
  HomeIcon,
  InformationCircleIcon,
  PhoneIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { LogInIcon } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavbarLanding() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-emerald-500 px-6 py-4 shadow-md text-white">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <span className="text-lg font-bold">E-POSYANDU</span>
        </Link>

        {/* Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden focus:outline-none"
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>

        {/* Menu Desktop */}
        <div className="hidden sm:flex gap-6 text-sm font-medium">
          <NavItem href="/" icon={<HomeIcon className="w-5 h-5" />} pathname={pathname}>Beranda</NavItem>
          {/* <NavItem href="/tentang" icon={<InformationCircleIcon className="w-5 h-5" />} pathname={pathname}>Tentang</NavItem> */}
          <NavItem href="/kontak" icon={<PhoneIcon className="w-5 h-5" />} pathname={pathname}>Kontak</NavItem>
          <NavItem href="/auth/login" icon={<LogInIcon className="w-5 h-5" />} pathname={pathname}>Login</NavItem>
        </div>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="flex flex-col gap-3 mt-4 sm:hidden">
          <NavItem href="/" icon={<HomeIcon className="w-5 h-5" />} pathname={pathname}>Beranda</NavItem>
          <NavItem href="/tentang" icon={<InformationCircleIcon className="w-5 h-5" />} pathname={pathname}>Tentang</NavItem>
          <NavItem href="/kontak" icon={<PhoneIcon className="w-5 h-5" />} pathname={pathname}>Kontak</NavItem>
          <NavItem href="/auth/login" icon={<LogInIcon className="w-5 h-5" />} pathname={pathname}>Login</NavItem>
        </div>
      )}
    </nav>
  );
}

function NavItem({
  href,
  icon,
  children,
  pathname,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  pathname: string;
}) {
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
        isActive
          ? 'bg-white text-emerald-600 font-semibold'
          : 'hover:bg-emerald-600'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
