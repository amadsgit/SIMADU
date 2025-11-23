'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function StatistikImunisasiChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // FIXED LIST JENIS IMUNISASI
  const imunisasiList = [
    "HB-0",
    "Polio-0 (OPV)",
    "BCG",
    "DPT-HB-Hib 1",
    "Polio 1",
    "PCV 1",
    "Rotavirus",
    "DPT-HB-Hib 2",
    "Polio 2",
    "PCV 2",
    "DPT-HB-Hib 3",
    "Polio 3/IPV",
    "Rotavirus (bila pentavalen)",
    "MR 1, JE (wilayah endemis)",
    "PCV booster",
    "MR 2",
    "DPT booster",
    "IPV booster"
  ];

  // WARNA PER KELURAHAN
  const kelurahanColors: Record<string, string> = {
    "Parung": "#EF4444",       // merah
    "Wanareja": "#FACC15",     // kuning
    "Soklat": "#10B981",       // hijau
    "Pasirkareumbi": "#3B82F6" // biru
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/pemproImunisasi/monitoring');
        const json = await res.json();
        const data = json?.data ?? [];

        const statistik: any = {};

        data.forEach((item: any) => {
          const kelurahan = item.posyandu?.kelurahan?.nama ?? 'Tidak diketahui';

          if (!statistik[kelurahan]) {
            statistik[kelurahan] = {};
            imunisasiList.forEach((i) => (statistik[kelurahan][i] = 0));
          }

          // LOOP pelaksanaan kegiatan
          item.pelaksanaan?.forEach((pel: any) => {
            pel.pemeriksaanBalita?.forEach((per: any) => {
              const imunisasiString = per.imunisasi;

              if (!imunisasiString) return;

              // example: "HB-0, Polio-0 (OPV), BCG"
              const splitted = imunisasiString
                .split(',')
                .map((i: string) => i.trim());

              // cek setiap jenis imunisasi hasil split
              splitted.forEach((jenis: string) => {
                if (imunisasiList.includes(jenis)) {
                  statistik[kelurahan][jenis]++;
                }
              });
            });
          });

        });

        // SIAPKAN DATASET UNTUK CHART
        const datasets = Object.keys(statistik).map((kelurahan) => ({
          label: kelurahan,
          data: imunisasiList.map((i) => statistik[kelurahan][i]),
          backgroundColor:
            kelurahanColors[kelurahan] ??
            `hsl(${Math.random() * 360}, 70%, 60%)`,
        }));

        setChartData({
          labels: imunisasiList,
          datasets,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading)
    return <div className="flex justify-center items-center py-16 text-emerald-600">
            <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span className="text-sm font-medium">Memuat data...</span>
          </div>;

  if (!chartData) return <p>Tidak ada data imunisasi.</p>;

  return (
    <div className="w-full h-[300px]">
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
          },
          plugins: {
            legend: { position: 'top' },
          },
        }}
      />
    </div>
  );
}
