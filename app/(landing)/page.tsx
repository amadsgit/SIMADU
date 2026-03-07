'use client';

import { useEffect, useMemo, useState } from 'react';
import NavbarLanding from '@/app/ui/landing/navbar-landing';
import FooterLanding from '@/app/ui/landing/footer-landing';
import MapPosyandu from './map-posyandu';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';


type Posyandu = {
  id: number;
  akreditasi: string;
  kelurahan: {
    nama: string;
  };
};

export default function Page() {
  const [data, setData] = useState<Posyandu[]>([]);
  const [loading, setLoading] = useState(true);
  const COLORS_AKREDITASI = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const COLORS_KELURAHAN = ['#fb7185', '#fbbf24', '#60a5fa', '#34d399'];


  useEffect(() => {
    fetch('/api/admin/posyandu')
      .then(res => res.json())
      .then(res => {
        setData(res);
        setLoading(false);
      });
  }, []);

  // =========================
  // OLahan DATA
  // =========================
  const totalPosyandu = data.length;

  const dataAkreditasi = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(item => {
      map[item.akreditasi] = (map[item.akreditasi] || 0) + 1;
    });
    return Object.entries(map).map(([name, total]) => ({
      name,
      total,
    }));
  }, [data]);

  const dataKelurahan = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(item => {
      const nama = item.kelurahan?.nama || 'Tidak diketahui';
      map[nama] = (map[nama] || 0) + 1;
    });
    return Object.entries(map).map(([name, total]) => ({
      name,
      total,
    }));
  }, [data]);

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-white via-emerald-50/40 to-white text-gray-800">
      <NavbarLanding />

      <div className="mt-6 md:px-10 lg:px-14 flex gap-6">
        <section className="flex-1">
          {/* MAP */}
          <div className="bg-white rounded-sm border border-emerald-100 shadow-md overflow-hidden">
            <div className="px-6 py-5 border-b border-emerald-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-emerald-600">
                Peta Sebaran Lokasi Posyandu
              </h2>
              <span className="text-xs text-gray-500">
                Wilayah kerja UPTD Puskesmas Cikalapa
              </span>
            </div>
            <div className="p-4">
              <MapPosyandu />
            </div>
          </div>

          {/* STATISTIK */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* DONUT AKREDITASI */}
            <div className="bg-white rounded-xl border border-emerald-100 shadow-md p-6 lg:col-span-1">
              <h3 className="font-semibold text-emerald-600 mb-4">
                Posyandu per Akreditasi
              </h3>

              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={dataAkreditasi}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {dataAkreditasi.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS_AKREDITASI[index % COLORS_AKREDITASI.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* BAR KELURAHAN */}
            <div className="bg-white rounded-xl border border-emerald-100 shadow-md p-6 lg:col-span-2">
              <h3 className="font-semibold text-emerald-600 mb-4">
                Posyandu per Kelurahan
              </h3>

              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dataKelurahan}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {dataKelurahan.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS_KELURAHAN[index % COLORS_KELURAHAN.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </section>
      </div>

      <FooterLanding />
    </main>
  );
}
