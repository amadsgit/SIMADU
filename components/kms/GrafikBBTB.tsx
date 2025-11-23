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

// ===============================
// DATA WHO BB/U Laki-laki 0–60 bulan
// ===============================
const WHO_BBU = {
  usia: Array.from({ length: 61 }, (_, i) => i), // 0–60 bulan
  median: [
    3.3, 4.4, 5.1, 5.8, 6.4, 6.9, 7.3, 7.6, 7.9, 8.2,
    8.4, 8.6, 8.8, 9.0, 9.2, 9.4, 9.6, 9.8, 10.0, 10.2,
    10.3, 10.5, 10.7, 10.9, 11.1, 11.3, 11.5, 11.7, 11.9, 12.1,
    12.2, 12.4, 12.6, 12.8, 12.9, 13.1, 13.3, 13.5, 13.7, 13.8,
    14.0, 14.2, 14.4, 14.5, 14.7, 14.9, 15.1, 15.3, 15.5, 15.7,
    15.9, 16.1, 16.3, 16.5, 16.7, 16.9, 17.1, 17.3, 17.5, 17.7, 17.9
  ],
  minus1SD: [
    2.9, 3.8, 4.5, 5.1, 5.6, 6.0, 6.4, 6.7, 7.0, 7.2,
    7.4, 7.6, 7.8, 8.0, 8.1, 8.3, 8.5, 8.6, 8.8, 8.9,
    9.1, 9.2, 9.4, 9.6, 9.7, 9.9, 10.1, 10.2, 10.4, 10.6,
    10.7, 10.9, 11.0, 11.2, 11.3, 11.5, 11.7, 11.8, 12.0, 12.1,
    12.3, 12.4, 12.6, 12.7, 12.9, 13.1, 13.2, 13.4, 13.5, 13.7,
    13.9, 14.0, 14.2, 14.3, 14.5, 14.7, 14.8, 15.0, 15.2, 15.3, 15.5
  ],
  minus2SD: [
    2.5, 3.3, 3.9, 4.4, 4.8, 5.1, 5.4, 5.7, 5.9, 6.1,
    6.3, 6.5, 6.6, 6.8, 6.9, 7.1, 7.2, 7.4, 7.5, 7.7,
    7.8, 8.0, 8.1, 8.2, 8.4, 8.5, 8.7, 8.8, 9.0, 9.1,
    9.2, 9.4, 9.5, 9.7, 9.8, 9.9, 10.1, 10.2, 10.4, 10.5,
    10.6, 10.8, 10.9, 11.1, 11.2, 11.3, 11.5, 11.6, 11.8, 11.9,
    12.0, 12.2, 12.3, 12.5, 12.6, 12.7, 12.9, 13.0, 13.2, 13.3, 13.4
  ]
};

export default function GrafikBBU() {
  const [chartData, setChartData] = useState<any>(null);
  const [pemeriksaanMap, setPemeriksaanMap] = useState<any>({});
  const [loading, setLoading] = useState(true);

useEffect(() => {
  async function load() {
    const res = await fetch('/api/ortubalita');
    const json = await res.json();
    const balita = json?.data?.[0];
    if (!balita) return;

    const pemeriksaan = [...balita.pemeriksaanBalita].sort(
      (a, b) =>
        new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
    );

    const labels: string[] = [];
    const beratBalita: number[] = [];
    const tooltipData: Record<number, any> = {};

    pemeriksaan.forEach((p, i) => {
      const ageMonths =
        (new Date(p.tanggal).getFullYear() - new Date(balita.tanggalLahir).getFullYear()) * 12 +
        (new Date(p.tanggal).getMonth() - new Date(balita.tanggalLahir).getMonth());

      labels.push(`${ageMonths} bln`);
      beratBalita.push(p.beratBadan);

      tooltipData[i] = {
        usiaBulan: labels[i],
        berat: p.beratBadan,
        tinggi: p.tinggiBadan,
        lingkarKepala: p.lingkarKepala,
        kategoriGizi: balita.statusGizi?.[i]?.kategoriGizi,
        statusStunting: balita.statusGizi?.[i]?.statusStunting
      };
    });

    setPemeriksaanMap(tooltipData);

    setChartData({
      labels,
      datasets: [
        // ============================
        // ZONA WARNAAA
        // ============================

        {
          label: 'Zona Merah (< -2SD)',
          data: WHO_BBU.minus2SD,
          borderColor: 'transparent',
          backgroundColor: 'rgba(239,68,68,0.35)',
          fill: {
            target: 'origin',
            below: 'rgba(239,68,68,0.35)'
          },
          pointRadius: 0,
          tension: 0.3
        },
        {
          label: 'Zona Kuning (-2SD s/d -1SD)',
          data: WHO_BBU.minus1SD,
          borderColor: 'transparent',
          backgroundColor: 'rgba(251,191,36,0.35)',
          fill: {
            target: 'previous',
            above: 'rgba(251,191,36,0.35)'
          },
          pointRadius: 0,
          tension: 0.3
        },
        {
          label: 'Zona Hijau Ideal',
          data: WHO_BBU.median,
          borderColor: 'transparent',
          backgroundColor: 'rgba(16,185,129,0.35)',
          fill: {
            target: 'previous',
            above: 'rgba(16,185,129,0.35)'
          },
          pointRadius: 0,
          tension: 0.3
        },

        // ============================
        // GARIS WHO
        // ============================

        {
          label: 'Median WHO',
          data: WHO_BBU.median,
          borderColor: '#10b981',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3
        },
        {
          label: '-1 SD',
          data: WHO_BBU.minus1SD,
          borderColor: '#fbbf24',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3
        },
        {
          label: '-2 SD',
          data: WHO_BBU.minus2SD,
          borderColor: '#ef4444',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3
        },

        // ============================
        // DATA BALITA
        // ============================

        {
          label: 'Berat Balita (kg)',
          data: beratBalita,
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
                  const d = pemeriksaanMap[ctx.dataIndex];
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
              title: { display: true, text: 'Berat Badan (kg)' }
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
