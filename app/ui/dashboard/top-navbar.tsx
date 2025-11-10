'use client';

import {
  Bell,
  User,
  LogOut,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type CustomSession = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

export default function TopNavbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession() as { data: CustomSession | null };

  const showLogoutConfirm = () => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 text-center max-w-sm mx-auto">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Konfirmasi Logout</h2>
          <p className="text-gray-600 mb-4">Apakah Anda yakin ingin keluar?</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 border rounded-lg hover:bg-gray-200 transition"
            >
              Batal
            </button>
            <button
              onClick={() => {
                handleLogout();
                onClose();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Ya, Logout
            </button>
          </div>
        </div>
      ),
    });
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/auth/login' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node))
        setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node))
        setIsNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg backdrop-blur-md border-b border-white/10">
      <div className="px-6 py-3 flex justify-between items-center">
        {/* Judul kiri */}
        <h1 className="font-semibold tracking-wide text-lg">
          Dashboard <span className="text-emerald-100">SIMADU</span>
        </h1>

        {/* Kanan: Notifikasi & Profil */}
        <div className="flex items-center gap-5">
          {/* Notifikasi */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 hover:bg-white/10 rounded-full transition"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                0
              </span>
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white text-gray-700 border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <div className="px-4 py-2 font-semibold text-gray-700 border-b bg-gray-50">
                  Notifikasi Terbaru
                </div>
                <ul className="text-sm max-h-60 overflow-y-auto">
                  <li className="px-4 py-3 hover:bg-gray-100 cursor-pointer">
                    🔔 Fitur notifikasi masih dalam pengembangan
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Profil */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 hover:bg-white/10 px-2 py-1.5 rounded-full transition"
            >
              <Image
                src="/favicon.ico"
                alt="User Avatar"
                width={32}
                height={32}
                className="rounded-full border border-white/20"
              />
              <span className="hidden md:block text-sm font-medium">
                {session?.user?.name || 'Loading...'}
              </span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                <div className="px-4 py-2 text-sm text-gray-700 border-b bg-gray-50 font-semibold">
                  {session?.user?.role || 'User'}
                </div>
                <Link
                  href="#"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="w-5 h-5 text-emerald-600" />
                  Profil
                </Link>
                <button
                  onClick={showLogoutConfirm}
                  className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="w-5 h-5 text-red-500" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
