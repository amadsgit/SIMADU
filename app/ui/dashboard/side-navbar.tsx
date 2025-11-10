'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Menu, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getFlatMenuByRole } from './navbar-links';

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role || 'guest';
  const flatMenu = getFlatMenuByRole(role);

  const renderIcon = (Icon: any) => <Icon className="w-5 h-5" />;

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-4 flex justify-between items-center shadow-md">
        <span className="font-semibold tracking-wide">PKM CIKALAPA</span>
        <button
          onClick={() => setOpen(!open)}
          className="focus:outline-none hover:opacity-80 transition"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed md:relative inset-y-0 left-0 w-64 z-50 transition-transform duration-300 ease-in-out backdrop-blur-md shadow-lg border-r border-white/20',
          'bg-gradient-to-b from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-900/70 text-gray-700 dark:text-gray-300',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Wrapper agar footer tetap di bawah */}
        <div className="flex flex-col h-screen justify-between relative">
          {/* Header + Navigation */}
          <div>
            <div className="p-5 border-b border-gray-200/50 dark:border-gray-700/50">
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                PKM CIKALAPA
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Sistem Informasi Manajemen Posyandu
              </p>
            </div>

            <nav className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
              {flatMenu.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-150 group',
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                        : 'hover:bg-emerald-50 dark:hover:bg-gray-800/60 hover:text-emerald-700 dark:hover:text-emerald-400'
                    )}
                  >
                    <span
                      className={clsx(
                        'transition-transform duration-200 group-hover:scale-110',
                        isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'
                      )}
                    >
                      {renderIcon(Icon)}
                    </span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 px-4 py-3 text-xs text-center text-gray-400">
            © {new Date().getFullYear()} SIMADU
          </div>
        </div>
      </aside>
    </>
  );
}
