'use client';

import { useState, useEffect, useMemo } from 'react';
import TabsPane from '@/components/tab-pane-manajemen-laporan';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Printer } from 'lucide-react';

export default function Page() {
  const [ibuHamil, setIbuHamil] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterKelurahan, setFilterKelurahan] = useState('');
  const [filterPosyandu, setFilterPosyandu] = useState('');
  const [filterRW, setFilterRW] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch data
  const fetchIbuHamil = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/laporan/ibuhamil');
      const json = await res.json();

      if (!json.success) throw new Error('Gagal memuat data');
      setIbuHamil(json.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat data ibu hamil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIbuHamil();
  }, []);

  // Filtered data
  const filteredData = useMemo(() => {
    return ibuHamil.filter((item: any) => {
      const matchKelurahan = filterKelurahan
        ? item.posyandu.kelurahan.nama === filterKelurahan
        : true;

      const matchPosyandu = filterPosyandu
        ? item.posyandu.nama === filterPosyandu
        : true;

      const matchRW = filterRW
        ? item.posyandu.wilayah === filterRW
        : true;

      return matchKelurahan && matchPosyandu && matchRW;
    });
  }, [ibuHamil, filterKelurahan, filterPosyandu, filterRW]);

  // Total pages
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Ensure pagination always valid
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterKelurahan, filterPosyandu, filterRW]);

  // Paginated result
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // === CETAK PDF DENGAN jsPDF (F4) ===
const handlePrintPDF = () => {
  const doc = new jsPDF('l', 'pt', [842, 1190]); // F4 landscape
  const now = new Date();

  // Header
  doc.setFontSize(14);
  doc.text('UPTD PUSKESMAS CIKALAPA', 40, 30);
  doc.setFontSize(10);
  doc.text('Laporan Data Ibu Hamil', 40, 50);
  doc.text(`Dicetak: ${now.toLocaleString()}`, 40, 65);

  autoTable(doc, {
    startY: 80,
    head: [[
      'No', 'NIK & No.KK',  'Nama', 'Tanggal Lahir', 'HPHT', 'HPL', 'Umur Kehamilan (minggu)',
      'BB Sebelum Hamil (kg)', 'TB Sebelum Hamil (cm)', 'LiLA (cm)', 'IMT Trimester 1 (kg/m²)',
      'Status Gizi KEK', 'Gravida (jumlah kehamilan)', 'Para (jumlah kelahiran)', 'Abortus (keguguran)', 'Gol. Darah', 
      'Kepemilikan JKN', 'Buku KIA', 'Suami', 'Alamat', 
      'Posyandu', 'Kelurahan', 'RW', 'Tanggal Didata'
    ]],
    body: filteredData.map((item, idx) => {
      const namaSuami = item.namaSuami ? `${item.namaSuami} ${item.HPSuami ?? ''}` : '-';
      const nikKK = item.nik ? `NIK:${item.nik} No.KK:${item.noKK ?? ''}` : '-';
      const alamat = `${item.alamat ?? '-'} RT.${item.RT ?? ''}/${item.RW ?? ''}`;
      const jkn = item.kepemilikanJKN ? `${item.kepemilikanJKN} ${item.noJKN ?? ''}` : '-';
      const golDarah = (item.golonganDarah && item.golonganDarah !== 'Belum_diperiksa') 
                  ? item.golonganDarah 
                  : '-';

      return [
        idx + 1,
        nikKK,
        item.nama ?? '-',
        item.tanggalLahir ? new Date(item.tanggalLahir).toLocaleDateString('id-ID') : '-',
        item.tanggalHPHT ? new Date(item.tanggalHPHT).toLocaleDateString('id-ID') : '-',
        item.tanggalHPL ? new Date(item.tanggalHPL).toLocaleDateString('id-ID') : '-',
        item.umurKehamilanAwal ?? '-',
        item.BBSH ?? '-',
        item.TBSH ?? '-',
        item.liLA ?? '-',
        item.IMTSH ?? '-',
        item.StatusGiziKEK ?? '-',
        item.gravida ?? '-',
        item.para ?? '-',
        item.abortus ?? '-',
        golDarah,
        jkn,
        item.kepemilikanBukuKIA ?? '-',
        namaSuami,
        alamat,
        item.posyandu?.nama ?? '-',
        item.posyandu?.kelurahan?.nama ?? '-',
        item.posyandu?.wilayah ?? '-',
        item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : '-'
      ];
    }),
    styles: {
      fontSize: 7,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [244, 63, 94],
      fontSize: 7,
      halign: 'center',
    },
    columnStyles: {
      // kolom yang panjang supaya wrap
      16: { cellWidth: 50, overflow: 'linebreak' }, // JKN
      18: { cellWidth: 60, overflow: 'linebreak' }, // Suami
      19: { cellWidth: 100, overflow: 'linebreak' }, // Alamat
    },
    pageBreak: 'auto'
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(9);
  doc.text(`Tanggal Cetak: ${now.toLocaleString('id-ID')}`, 40, finalY);

  doc.save(`Laporan_Data_IbuHamil_${now.toISOString().split('T')[0]}.pdf`);
};


  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-2xl font-bold">Rekap Data Ibu Hamil</h2>
      </div>

      <TabsPane />

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5 mt-5 items-center">
        <select
          value={filterKelurahan}
          onChange={(e) => setFilterKelurahan(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Semua Kelurahan</option>
          {Array.from(new Set(ibuHamil.map((d) => d.posyandu.kelurahan.nama))).map(
            (kel) => (
              <option key={kel} value={kel}>{kel}</option>
            )
          )}
        </select>

        <select
          value={filterPosyandu}
          onChange={(e) => setFilterPosyandu(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Semua Posyandu</option>
          {Array.from(new Set(ibuHamil.map((d) => d.posyandu.nama))).map(
            (pos) => (
              <option key={pos} value={pos}>{pos}</option>
            )
          )}
        </select>

        <select
          value={filterRW}
          onChange={(e) => setFilterRW(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Semua RW</option>
          {Array.from(new Set(ibuHamil.map((d) => d.posyandu.wilayah))).map(
            (rw) => (
              <option key={rw} value={rw}>{rw}</option>
            )
          )}
        </select>

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
              <th className="p-2 border">NIK & No.KK</th>
              <th className="p-2 border">Nama</th>
              <th className="p-2 border">Tanggal Lahir</th>
              <th className="p-2 border">HPHT</th>
              <th className="p-2 border">HPL</th>
              <th className="p-2 border">Umur Kehamilan (minggu)</th>
              <th className="p-2 border">BB Sebelum Hamil (kg)</th>
              <th className="p-2 border">TB Sebelum Hamil (cm)</th>
              <th className="p-2 border">LiLA (cm)</th>
              <th className="p-2 border">IMT Trimester 1 (kg/m²)</th>
              <th className="p-2 border">Status Gizi KEK</th>
              <th className="p-2 border">Gravida (jumlah kehamilan)</th>
              <th className="p-2 border">Para (jumlah kelahiran)</th>
              <th className="p-2 border">Abortus (jumlah keguguran)</th>
              <th className="p-2 border">Gol. Darah</th>
              <th className="p-2 border">JKN / No JKN</th>
              <th className="p-2 border">Buku KIA</th>
              <th className="p-2 border">Suami</th>
              <th className="p-2 border">Alamat</th>
              <th className="p-2 border">Posyandu</th>
              <th className="p-2 border">Kelurahan</th>
              <th className="p-2 border">RW</th>
              <th className="p-2 border">Tanggal Didata</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={14} className="text-center p-6">
                  <div className="flex justify-center items-center py-16 text-pink-600">
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
                <td className="p-2 border">NIK: {item.nik} No.KK: {item.nik}</td>
                <td className="p-2 border">{item.nama}</td>
                <td className="p-2 border">{new Date(item.tanggalLahir).toLocaleDateString()}</td>
                <td className="p-2 border">{item.tanggalHPHT ? new Date(item.tanggalHPHT).toLocaleDateString() : '-'}</td>
                <td className="p-2 border">{item.tanggalHPL ? new Date(item.tanggalHPL).toLocaleDateString() : '-'}</td>
                <td className="p-2 border">{item.umurKehamilanAwal}</td>
                <td className="p-2 border">{item.BBSH}</td>
                <td className="p-2 border">{item.TBSH}</td>
                <td className="p-2 border">{item.liLA}</td>
                <td className="p-2 border">{item.IMTSH}</td>
                <td className="p-2 border">{item.StatusGiziKEK}</td>
                <td className="p-2 border">{item.gravida}</td>
                <td className="p-2 border">{item.para}</td>
                <td className="p-2 border">{item.abortus}</td>
                <td className="p-2 border">{item.golonganDarah}</td>
                <td className="p-2 border">{item.kepemilikanJKN} <br />{item.noJKN}</td>
                <td className="p-2 border">{item.kepemilikanBukuKIA}</td>
                <td className="p-2 border">{item.namaSuami} <br /> {item.HPSuami}</td>
                <td className="p-2 border">{item.alamat} RT.{item.RT}/{item.RW}</td>
                <td className="p-2 border">{item.posyandu.nama}</td>
                <td className="p-2 border">{item.posyandu.kelurahan.nama}</td>
                <td className="p-2 border">{item.posyandu.wilayah}</td>
                <td className="p-2 border">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : '-'}</td>
              </tr>
            ))}

            {!loading && paginatedList.length === 0 && (
              <tr>
                <td colSpan={24} className="text-center p-4 text-gray-500">Tidak ada data</td>
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
