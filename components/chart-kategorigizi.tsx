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

const kategoriColors: { [key: string]: string } = {
  'Gizi Baik': '#34D399',
  'Risiko Gizi Lebih': '#FBBF24',
  'Gizi Kurang': '#F87171',
  'Gizi Buruk': '#EF4444',
};

export default function KategoriGiziChart() {
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

        const kategoriPerBulan: { [kategori: string]: number[] } = {
          'Gizi Baik': Array(12).fill(0),
          'Risiko Gizi Lebih': Array(12).fill(0),
          'Gizi Kurang': Array(12).fill(0),
          'Gizi Buruk': Array(12).fill(0),
        };

        pemeriksaanData.forEach((item: { statusGizi: any[] }) => {
          if (!item.statusGizi) return;
          item.statusGizi.forEach((sg: any) => {
            const kategori = sg.kategoriGizi || 'Tidak diketahui';
            const monthIndex = new Date(sg.tanggal).getMonth();
            if (kategoriPerBulan[kategori] !== undefined) {
              kategoriPerBulan[kategori][monthIndex]++;
            }
          });
        });

        const datasets = Object.keys(kategoriPerBulan).map((key) => ({
          label: key,
          data: kategoriPerBulan[key],
          borderColor: kategoriColors[key] || '#888',
          backgroundColor: kategoriColors[key] || '#888',
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

  if (loading) return <div className="flex justify-center items-center py-16 text-emerald-600">
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
  if (!chartData) return <p>Tidak ada data.</p>;

  return (
    <Line
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' }, tooltip: { mode: 'index', intersect: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      }}
    />
  );
}
