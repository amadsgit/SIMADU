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
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const stuntingColors: { [key: string]: string } = {
  Normal: '#34D399',          // hijau
  Pendek: '#F87171',          // merah muda
  'Sangat Pendek': '#EF4444', // merah
};

export default function StatistikStuntingChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/laporan/balita/pemeriksaan');
        const json = await res.json();
        const pemeriksaanData = json?.data ?? [];

        const months = [
          'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
        ];

        // === 3 kategori stunting ===
        const stuntingPerBulan: { [kategori: string]: number[] } = {
          Normal: Array(12).fill(0),
          Pendek: Array(12).fill(0),
          'Sangat Pendek': Array(12).fill(0),
        };

        pemeriksaanData.forEach((item: { statusGizi: any[] }) => {
          if (!item.statusGizi) return;

          item.statusGizi.forEach((sg: any) => {
            const stunting = sg.statusStunting; // ambil statusStunting
            const monthIndex = new Date(sg.tanggal).getMonth();

            if (stuntingPerBulan[stunting] !== undefined) {
              stuntingPerBulan[stunting][monthIndex]++;
            }
          });
        });

        const datasets = Object.keys(stuntingPerBulan).map((key) => ({
          label: key,
          data: stuntingPerBulan[key],
          borderColor: stuntingColors[key],
          backgroundColor: stuntingColors[key],
          borderWidth: 2,
          fill: false,
          tension: 0.3,
        }));

        setChartData({ labels: months, datasets });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p className="text-emerald-600">Memuat grafik...</p>;
  if (!chartData) return <p>Tidak ada data.</p>;

  return (
    <Line
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
      }}
    />
  );
}
