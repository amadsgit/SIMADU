'use client';

import { useState, useEffect, useMemo } from 'react';
import TabsPane from '@/components/tab-pane-manajemen-laporan';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Printer } from 'lucide-react';

export default function Page() {
  const [pemeriksaan, setPemeriksaan] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterKelurahan, setFilterKelurahan] = useState('');
  const [filterPosyandu, setFilterPosyandu] = useState('');
  const [filterRW, setFilterRW] = useState('');
  const [filterTanggal, setFilterTanggal] = useState(''); // format yyyy-mm-dd
  const [filterBulan, setFilterBulan] = useState('');     // format yyyy-mm

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch data
  const fetchPemeriksaan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/laporan/balita/pemeriksaan');
      const json = await res.json();
      if (!json.success) throw new Error('Gagal memuat data');
      setPemeriksaan(json.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat data pemeriksaan balita');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPemeriksaan();
  }, []);

  // Filtered data
  const filteredData = useMemo(() => {
    return pemeriksaan.filter((item: any) => {
      const balita = item.balita;

      const matchKelurahan = filterKelurahan
        ? balita.posyandu.kelurahan.nama === filterKelurahan
        : true;

      const matchPosyandu = filterPosyandu
        ? balita.posyandu.nama === filterPosyandu
        : true;

      const matchRW = filterRW
        ? balita.posyandu.wilayah === filterRW
        : true;

      const matchTanggal = filterTanggal
        ? new Date(item.tanggal).toISOString().split('T')[0] === filterTanggal
        : true;

      const matchBulan = filterBulan
        ? new Date(item.tanggal).toISOString().slice(0, 7) === filterBulan
        : true;

      return matchKelurahan && matchPosyandu && matchRW && matchTanggal && matchBulan;
    });
  }, [pemeriksaan, filterKelurahan, filterPosyandu, filterRW, filterTanggal, filterBulan]);

  // Total pages
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Ensure pagination always valid
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages || 1);
  }, [totalPages]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterKelurahan, filterPosyandu, filterRW, filterTanggal, filterBulan]);

  // Paginated result
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // === CETAK PDF DENGAN jsPDF ===
  const handlePrintPDF = () => {
    const doc = new jsPDF('l', 'pt', [842, 1190]);
    const now = new Date();

    doc.setFontSize(14);
    doc.text('UPTD PUSKESMAS CIKALAPA', 40, 30);
    doc.setFontSize(10);
    doc.text(`Laporan Pemeriksaan Balita`, 40, 50);
    doc.text(`Dicetak: ${now.toLocaleString()}`, 40, 65);

    autoTable(doc, {
      startY: 80,
      head: [[
        'No', 'Tanggal', 'Kegiatan', 'NIK', 'Nama Balita', 'Tanggal Lahir',
        'Berat Badan (kg)', 'Tinggi Badan (cm)', 'Lingkar Kepala (cm)', 'Imunisasi',
        'Jenis Vitamin', 'Jenis PMT', 'Kategori Gizi', 'Status Stunting', 'Keluhan', 'Tindakan', 'Catatan',
        'Posyandu', 'RW', 'Kelurahan'
      ]],
      body: filteredData.map((item, idx) => {
        const gizi = item.statusGizi?.find(
            (s: { tanggal: string }) =>
            s.tanggal.split('T')[0] === item.tanggal.split('T')[0]
        );

        return [
            idx + 1,
            item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '-',
            item.pelaksanaanKegiatan?.kegiatan?.nama ?? '-',
            item.balita?.nik ?? '-',
            item.balita?.nama ?? '-',
            item.balita?.tanggalLahir ? new Date(item.balita?.tanggalLahir).toLocaleDateString('id-ID') : '-',
            item.beratBadan ?? '-',
            item.tinggiBadan ?? '-',
            item.lingkarKepala ?? '-',
            item.imunisasi ?? '-',
            item.jenisVitamin ?? '-',
            item.jenisPmt ?? '-',
            gizi?.kategoriGizi ?? '-',
            gizi?.statusStunting ?? '-',
            item.keluhan ?? '-',
            item.tindakan ?? '-',
            item.catatan ?? '-',
            item.balita?.posyandu?.nama ?? '-',
            item.balita?.posyandu?.wilayah ?? '-',
            item.balita?.posyandu?.kelurahan?.nama ?? '-'
        ];
        }),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [16, 185, 129], halign: 'center' },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(9);
    doc.text(`Tanggal Cetak: ${now.toLocaleString('id-ID')}`, 40, finalY);

    doc.save(`Laporan_Pemeriksaan_Balita_${now.toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-2xl font-bold">Laporan Pemeriksaan Balita</h2>
      </div>

      <TabsPane />

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-5 mt-5 items-center">
        <select
          value={filterKelurahan}
          onChange={(e) => setFilterKelurahan(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Semua Kelurahan</option>
          {Array.from(new Set(pemeriksaan.map((d) => d.balita.posyandu.kelurahan.nama))).map(
            (kel) => <option key={kel} value={kel}>{kel}</option>
          )}
        </select>

        <select
          value={filterPosyandu}
          onChange={(e) => setFilterPosyandu(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Semua Posyandu</option>
          {Array.from(new Set(pemeriksaan.map((d) => d.balita.posyandu.nama))).map(
            (pos) => <option key={pos} value={pos}>{pos}</option>
          )}
        </select>

        <select
          value={filterRW}
          onChange={(e) => setFilterRW(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Semua RW</option>
          {Array.from(new Set(pemeriksaan.map((d) => d.balita.posyandu.wilayah))).map(
            (rw) => <option key={rw} value={rw}>{rw}</option>
          )}
        </select>

        <input
          type="date"
          value={filterTanggal}
          onChange={(e) => setFilterTanggal(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="month"
          value={filterBulan}
          onChange={(e) => setFilterBulan(e.target.value)}
          className="border p-2 rounded"
        />

        <div className="flex justify-end">
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            <Printer className="w-5 h-5" />
            Print PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">No</th>
              <th className="p-2 border">Tanggal</th>
              <th className="p-2 border">Kegiatan</th>
              <th className="p-2 border">NIK</th>
              <th className="p-2 border">Nama Balita</th>
              <th className="p-2 border">Tanggal Lahir</th>
              <th className="p-2 border">Berat Badan (kg)</th>
              <th className="p-2 border">Tinggi Badan (cm)</th>
              <th className="p-2 border">Lingkar Kepala (cm)</th>
              <th className="p-2 border">Imunisasi</th>
              <th className="p-2 border">Jenis Vitamin</th>
              <th className="p-2 border">Jenis PMT</th>
              <th className="p-2 border">Status Gizi</th>
              <th className="p-2 border">Status Stunting</th>
              <th className="p-2 border">Keluhan</th>
              <th className="p-2 border">Tindakan</th>
              <th className="p-2 border">Catatan</th>
              <th className="p-2 border">Posyandu</th>
              <th className="p-2 border">RW</th>
              <th className="p-2 border">Kelurahan</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={17} className="text-center p-6">
                  <div className="flex justify-center items-center py-16 text-emerald-600">
                    <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Memuat data...</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading && paginatedList.map((item, index) => (
              <tr key={item.id}>
                <td className="p-2 border">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td className="p-2 border">{item.tanggal ? new Date(item.tanggal).toLocaleDateString() : '-'}</td>
                <td className="p-2 border">{item.pelaksanaanKegiatan?.kegiatan?.nama ?? '-'}</td>
                <td className="p-2 border">{item.balita?.nik ?? '-'}</td>
                <td className="p-2 border">{item.balita?.nama ?? '-'}</td>
                <td className="p-2 border">{item.balita?.tanggalLahir ? new Date(item.balita.tanggalLahir).toLocaleDateString() : '-'}</td>
                <td className="p-2 border">{item.beratBadan ?? '-'}</td>
                <td className="p-2 border">{item.tinggiBadan ?? '-'}</td>
                <td className="p-2 border">{item.lingkarKepala ?? '-'}</td>
                <td className="p-2 border">{item.imunisasi ?? '-'}</td>
                <td className="p-2 border">{item.jenisVitamin ?? '-'}</td>
                <td className="p-2 border">{item.jenisPmt ?? '-'}</td>
                <td className="p-2 border">
                {item.statusGizi?.find((s: { tanggal: string; kategoriGizi: string }) =>
                    s.tanggal.split('T')[0] === item.tanggal.split('T')[0]
                )?.kategoriGizi ?? '-'}
                </td>
                <td className="p-2 border">
                {item.statusGizi?.find((s: { tanggal: string; statusStunting: string }) =>
                    s.tanggal.split('T')[0] === item.tanggal.split('T')[0]
                )?.statusStunting ?? '-'}
                </td>
                <td className="p-2 border">{item.keluhan ?? '-'}</td>
                <td className="p-2 border">{item.tindakan ?? '-'}</td>
                <td className="p-2 border">{item.catatan ?? '-'}</td>
                <td className="p-2 border">{item.balita?.posyandu?.nama ?? '-'}</td>
                <td className="p-2 border">{item.balita?.posyandu?.wilayah ?? '-'}</td>
                <td className="p-2 border">{item.balita?.posyandu?.kelurahan?.nama ?? '-'}</td>
              </tr>
            ))}

            {!loading && paginatedList.length === 0 && (
              <tr>
                <td colSpan={17} className="text-center p-4 text-gray-500">Tidak ada data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 p-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-sm">{currentPage} / {totalPages}</span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
