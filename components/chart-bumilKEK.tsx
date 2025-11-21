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

  if (loading) return <p>Memuat grafik KEK...</p>;
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
