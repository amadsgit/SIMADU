'use client';

import Link from 'next/link';
import {
  MapPin,
  Baby,
  HeartPulse,
  LogIn,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavbarLanding() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-emerald-500 px-6 py-4 shadow-lg text-white">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <span className="text-lg font-extrabold tracking-wide">
           ⚘ SIMADU
          </span>
        </Link>

        {/* Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden focus:outline-none"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Menu Desktop */}
        <div className="hidden sm:flex gap-6 text-sm font-medium">
          <NavItem
            href="/"
            icon={<MapPin className="w-5 h-5" />}
            pathname={pathname}
          >
            Lokasi Posyandu
          </NavItem>

          <NavItem
            href="/balita"
            icon={<Baby className="w-5 h-5" />}
            pathname={pathname}
          >
            Sebaran Balita
          </NavItem>

          <NavItem
            href="/ibu-hamil"
            icon={<HeartPulse className="w-5 h-5" />}
            pathname={pathname}
          >
            Sebaran Ibu Hamil
          </NavItem>

          <NavItem
            href="/auth/login"
            icon={<LogIn className="w-5 h-5" />}
            pathname={pathname}
          >
            Login
          </NavItem>
        </div>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="flex flex-col gap-3 mt-4 sm:hidden">
          <NavItem href="/" icon={<MapPin className="w-5 h-5" />} pathname={pathname}>
            Lokasi Posyandu
          </NavItem>

          <NavItem href="/balita" icon={<Baby className="w-5 h-5" />} pathname={pathname}>
            Sebaran Balita
          </NavItem>

          <NavItem
            href="/ibu-hamil"
            icon={<HeartPulse className="w-5 h-5" />}
            pathname={pathname}
          >
            Sebaran Ibu Hamil
          </NavItem>

          <NavItem
            href="/auth/login"
            icon={<LogIn className="w-5 h-5" />}
            pathname={pathname}
          >
            Login
          </NavItem>
        </div>
      )}
    </nav>
  );
}

function NavItem({ href, icon, children, pathname }: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  pathname: string;
}) {
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
        isActive
          ? 'bg-white text-emerald-600 font-semibold shadow-sm'
          : 'hover:bg-emerald-600 hover:bg-opacity-40'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
