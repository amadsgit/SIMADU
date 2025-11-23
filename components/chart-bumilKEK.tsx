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

const kekColors = {
  KEK: '#EF4444',
  'Tidak KEK': '#34D399',
};

export default function StatistikKEKChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/laporan/ibuhamil');
        const json = await res.json();
        const data = json?.data ?? [];

        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

        const statistik: any = {};

        data.forEach((item: any) => {
          const kelurahan = item.posyandu?.kelurahan?.nama ?? 'Tidak diketahui';
          const kategori = item.StatusGiziKEK;

          // Langsung ambil createdAt karena endpoint sudah bersih
          const tanggal = item.createdAt;
          if (!tanggal) return;

          const monthIndex = new Date(tanggal).getMonth();

          if (!statistik[kelurahan]) {
            statistik[kelurahan] = {
              KEK: Array(12).fill(0),
              'Tidak KEK': Array(12).fill(0),
            };
          }

          if (kategori === 'KEK' || kategori === 'Tidak KEK') {
            statistik[kelurahan][kategori][monthIndex]++;
          }
        });

        // Buat dataset grafik
        const datasets: any[] = [];

        Object.keys(statistik).forEach((kelurahan) => {
          datasets.push({
            label: `${kelurahan} - KEK`,
            data: statistik[kelurahan].KEK,
            backgroundColor: kekColors.KEK,
          });

          datasets.push({
            label: `${kelurahan} - Tidak KEK`,
            data: statistik[kelurahan]['Tidak KEK'],
            backgroundColor: kekColors['Tidak KEK'],
          });
        });

        setChartData({ labels: months, datasets });

      } catch (error) {
        console.error(error);
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
  if (!chartData) return <p>Tidak ada data KEK.</p>;

  return (
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
  );
}
