'use client';

import { MapPin, Baby, HeartPulse, Instagram, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function FooterLanding() {

  const [visitors, setVisitors] = useState<number | null>(null);

  useEffect(() => {
    const getVisitors = async () => {
      try {
        const res = await fetch("/api/visitor");
        const data = await res.json();
        setVisitors(data.total);
      } catch (error) {
        console.error("Gagal mengambil visitor", error);
      }
    };

    getVisitors();
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">

        {/* Brand */}
        <div>
          <h2 className="text-xl font-bold text-white">
            ⚘ SIMADU
          </h2>
          <p className="text-sm mt-3 leading-relaxed text-gray-400">
            Sistem Informasi Manajemen Posyandu untuk memantau lokasi Posyandu,
            sebaran balita, serta ibu hamil di wilayah kerja
            Puskesmas Cikalapa.
          </p>

          <p className="text-xs text-gray-500 mt-4">
            © {new Date().getFullYear()} SIMADU. All Rights Reserved.
          </p>
        </div>

        {/* Navigasi */}
        <div>
          <h3 className="text-white font-semibold mb-3">
            Navigasi
          </h3>

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 hover:text-white">
              <MapPin size={16} />
              Lokasi Posyandu
            </li>

            <li className="flex items-center gap-2 hover:text-white">
              <Baby size={16} />
              Sebaran Balita
            </li>

            <li className="flex items-center gap-2 hover:text-white">
              <HeartPulse size={16} />
              Sebaran Ibu Hamil
            </li>
          </ul>
        </div>

        {/* Statistik & Sosial */}
        <div>
          <h3 className="text-white font-semibold mb-3">
            Statistik Pengunjung
          </h3>

          <div className="flex items-center gap-2 text-lg font-semibold text-emerald-400">
            <Users size={18} />
            {visitors !== null ? visitors.toLocaleString() : "..."} Pengunjung
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Total kunjungan website
          </p>

          <div className="mt-6">
            <h3 className="text-white font-semibold mb-2">
              Developer
            </h3>

            <a
              href="https://www.instagram.com/m2d.ahm/"
              target="_blank"
              className="flex items-center gap-2 text-sm hover:text-white"
            >
              <Instagram size={16} />
              M Ahmad
            </a>
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-500">
        SIMADU - Sistem Informasi Manajemen Posyandu
      </div>
    </footer>
  );
}