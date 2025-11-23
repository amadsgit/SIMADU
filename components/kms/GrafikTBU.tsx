'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

// =============================================================
// WHO TB/U (Tinggi Badan menurut Umur) ⬆️ Boys 0–60 bulan
// Sumber: WHO Child Growth Standards (Length/Height-for-age Boys)
// =============================================================
const WHO_TBU = {
  usia: Array.from({ length: 61 }, (_, i) => i), // 0–60 bulan

  median: [
    49.9, 54.7, 58.4, 61.4, 63.9, 65.9, 67.6, 69.2, 70.6, 72.0,
    73.3, 74.5, 75.7, 76.9, 78.0, 79.1, 80.2, 81.2, 82.3, 83.2,
    84.2, 85.1, 86.0, 86.9, 87.8, 88.7, 89.6, 90.4, 91.3, 92.1,
    92.9, 93.7, 94.5, 95.2, 96.0, 96.7, 97.5, 98.2, 98.9, 99.6,
    100.3, 101.0, 101.7, 102.4, 103.1, 103.8, 104.5, 105.1, 105.8, 106.4,
    107.0, 107.7, 108.3, 108.9, 109.5, 110.1, 110.7, 111.3, 111.9, 112.5, 113.0
  ],

  minus1SD: [
    48.0, 52.8, 56.4, 59.4, 61.8, 63.8, 65.5, 67.0, 68.4, 69.7,
    71.0, 72.2, 73.4, 74.5, 75.6, 76.7, 77.7, 78.7, 79.7, 80.6,
    81.5, 82.4, 83.3, 84.1, 85.0, 85.8, 86.6, 87.4, 88.2, 89.0,
    89.8, 90.5, 91.3, 92.0, 92.7, 93.4, 94.1, 94.8, 95.5, 96.1,
    96.8, 97.5, 98.1, 98.8, 99.4, 100.0, 100.7, 101.3, 101.9, 102.5,
    103.1, 103.7, 104.3, 104.9, 105.5, 106.1, 106.7, 107.3, 107.8, 108.4, 108.9
  ],

  minus2SD: [
    46.1, 50.8, 54.4, 57.3, 59.7, 61.7, 63.3, 64.8, 66.2, 67.5,
    68.7, 69.9, 71.0, 72.1, 73.1, 74.1, 75.0, 76.0, 76.9, 77.7,
    78.6, 79.4, 80.2, 81.0, 81.7, 82.5, 83.2, 83.9, 84.6, 85.3,
    86.0, 86.7, 87.3, 88.0, 88.6, 89.3, 89.9, 90.5, 91.1, 91.7,
    92.3, 92.9, 93.5, 94.1, 94.7, 95.2, 95.8, 96.4, 96.9, 97.5,
    98.0, 98.6, 99.1, 99.7, 100.2, 100.7, 101.3, 101.8, 102.3, 102.8, 103.3
  ]
};

export default function GrafikTBU() {
  const [chartData, setChartData] = useState<any>(null);
  const [tooltipMap, setTooltipMap] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/ortubalita');
      const json = await res.json();
      const balita = json?.data?.[0];
      if (!balita) return;

      const pemeriksaan = [...balita.pemeriksaanBalita].sort(
        (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
      );

      const labels: string[] = [];
      const tinggiBalita: number[] = [];
      const tMap: Record<number, any> = {};

      pemeriksaan.forEach((p, i) => {
        const ageMonths =
          (new Date(p.tanggal).getFullYear() - new Date(balita.tanggalLahir).getFullYear()) * 12 +
          (new Date(p.tanggal).getMonth() - new Date(balita.tanggalLahir).getMonth());

        labels.push(`${ageMonths} bln`);
        tinggiBalita.push(p.tinggiBadan);

        tMap[i] = {
          usiaBulan: labels[i],
          berat: p.beratBadan,
          tinggi: p.tinggiBadan,
          lingkarKepala: p.lingkarKepala,
          kategoriGizi: balita.statusGizi?.[i]?.kategoriGizi,
          statusStunting: balita.statusGizi?.[i]?.statusStunting
        };
      });

      setTooltipMap(tMap);

      setChartData({
        labels,
        datasets: [
          // ==========================
          // ZONA -2SD (Merah)
          // ==========================
          {
            label: 'Zona Merah (< -2SD)',
            data: WHO_TBU.minus2SD,
            borderColor: 'transparent',
            backgroundColor: 'rgba(239,68,68,0.35)',
            fill: { target: 'origin', below: 'rgba(239,68,68,0.35)' },
            pointRadius: 0,
            tension: 0.3
          },

          // ==========================
          // ZONA -1SD (Kuning)
          // ==========================
          {
            label: 'Zona Kuning (-2SD s/d -1SD)',
            data: WHO_TBU.minus1SD,
            borderColor: 'transparent',
            backgroundColor: 'rgba(251,191,36,0.35)',
            fill: { target: 'previous', above: 'rgba(251,191,36,0.35)' },
            pointRadius: 0,
            tension: 0.3
          },

          // ==========================
          // ZONA MEDIAN (Hijau)
          // ==========================
          {
            label: 'Zona Hijau Ideal',
            data: WHO_TBU.median,
            borderColor: 'transparent',
            backgroundColor: 'rgba(16,185,129,0.35)',
            fill: { target: 'previous', above: 'rgba(16,185,129,0.35)' },
            pointRadius: 0,
            tension: 0.3
          },

          // ==========================
          // GARIS WHO
          // ==========================
          {
            label: 'Median WHO',
            data: WHO_TBU.median,
            borderColor: '#10b981',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.3
          },
          {
            label: '-1 SD',
            data: WHO_TBU.minus1SD,
            borderColor: '#fbbf24',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.3
          },
          {
            label: '-2 SD',
            data: WHO_TBU.minus2SD,
            borderColor: '#ef4444',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.3
          },

          // ==========================
          // DATA TINGGI BALITA
          // ==========================
          {
            label: 'Tinggi Balita (cm)',
            data: tinggiBalita,
            borderColor: '#2563eb',
            backgroundColor: '#2563eb',
            pointRadius: 6,
            borderWidth: 3,
            tension: 0.3
          }
        ]
      });

      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <p>Memuat grafik...</p>;
  if (!chartData) return <p>Tidak ada data.</p>;

  return (
    <div className="w-full h-80">
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const d = tooltipMap[ctx.dataIndex];
                  return [
                    `Usia: ${d.usiaBulan}`,
                    `BB: ${d.berat} kg`,
                    `TB: ${d.tinggi} cm`,
                    `LK: ${d.lingkarKepala} cm`,
                    `Gizi: ${d.kategoriGizi}`,
                    `Stunting: ${d.statusStunting}`
                  ];
                }
              }
            }
          },
          scales: {
            y: {
              title: { display: true, text: 'Tinggi Anak (cm)' }
            },
            x: {
              title: { display: true, text: 'Usia (bulan)' }
            }
          }
        }}
      />
    </div>
  );
}
