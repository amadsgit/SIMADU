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
    <nav className="fixed top-0 left-0 w-full z-[9999] bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white shadow-md mb-20">
      
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-wide">
            ⚘ SIMADU
          </span>
        </Link>

        {/* Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden focus:outline-none"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
          <NavItem href="/" icon={<MapPin size={18} />} pathname={pathname}>
            Lokasi Posyandu
          </NavItem>

          <NavItem href="/balita" icon={<Baby size={18} />} pathname={pathname}>
            Sebaran Balita
          </NavItem>

          <NavItem href="/ibu-hamil" icon={<HeartPulse size={18} />} pathname={pathname}>
            Sebaran Ibu Hamil
          </NavItem>

          <NavItem href="/auth/login" icon={<LogIn size={18} />} pathname={pathname}>
            Login
          </NavItem>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden px-6 pb-4 flex flex-col gap-2 bg-emerald-600">
          <NavItem href="/" icon={<MapPin size={18} />} pathname={pathname}>
            Lokasi Posyandu
          </NavItem>

          <NavItem href="/balita" icon={<Baby size={18} />} pathname={pathname}>
            Sebaran Balita
          </NavItem>

          <NavItem href="/ibu-hamil" icon={<HeartPulse size={18} />} pathname={pathname}>
            Sebaran Ibu Hamil
          </NavItem>

          <NavItem href="/auth/login" icon={<LogIn size={18} />} pathname={pathname}>
            Login
          </NavItem>
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
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-white/90 text-emerald-700 font-semibold shadow-sm'
          : 'hover:bg-white/15'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}