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
  const [filterTanggal, setFilterTanggal] = useState(''); // yyyy-mm-dd
  const [filterBulan, setFilterBulan] = useState('');     // yyyy-mm

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch data
  const fetchIbuHamil = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/laporan/ibuhamil/pemeriksaan');
      const json = await res.json();
      if (!json.success) throw new Error('Gagal memuat data');
      setIbuHamil(json.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat data pemeriksaan ibu hamil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIbuHamil();
  }, []);

  // Filtered data (mengacu pada pemeriksaanKehamilan)
  const filteredData = useMemo(() => {
    return ibuHamil.flatMap((item: any) =>
      item.pemeriksaanKehamilan.map((p: any) => ({
        ...p,
        ibu: item
      }))
    ).filter((item: any) => {
      const ibu = item.ibu;

      const matchKelurahan = filterKelurahan
        ? ibu.posyandu.kelurahan.nama === filterKelurahan
        : true;

      const matchPosyandu = filterPosyandu
        ? ibu.posyandu.nama === filterPosyandu
        : true;

      const matchRW = filterRW
        ? ibu.posyandu.wilayah === filterRW
        : true;

      const matchTanggal = filterTanggal
        ? new Date(item.tanggal).toISOString().split('T')[0] === filterTanggal
        : true;

      const matchBulan = filterBulan
        ? new Date(item.tanggal).toISOString().slice(0, 7) === filterBulan
        : true;

      return matchKelurahan && matchPosyandu && matchRW && matchTanggal && matchBulan;
    });
  }, [ibuHamil, filterKelurahan, filterPosyandu, filterRW, filterTanggal, filterBulan]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages || 1);
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterKelurahan, filterPosyandu, filterRW, filterTanggal, filterBulan]);

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // === CETAK PDF ===
  const handlePrintPDF = () => {
    const doc = new jsPDF('l', 'pt', [842, 1190]);
    const now = new Date();

    doc.setFontSize(14);
    doc.text('UPTD PUSKESMAS CIKALAPA', 40, 30);
    doc.setFontSize(10);
    doc.text(`Laporan Pemeriksaan Ibu Hamil`, 40, 50);
    doc.text(`Dicetak: ${now.toLocaleString()}`, 40, 65);

    autoTable(doc, {
      startY: 80,
      head: [[
        'No', 'Tanggal', 'NIK', 'Nama Ibu Hamil', 'No KK', 'Tanggal Lahir',
        'BB Sebelum Hamil (kg)', 'TB Sebelum Hamil (cm)', 'LiLA (cm)', 'IMT Trimester 1', 'Status Gizi KEK',
        'HPHT', 'HPL', 'Usia Kehamilan', 'Gravida', 'Para', 'Abortus',
        'Berat Badan (kg)', 'Tekanan Darah', 'Tinggi Fundus (cm)', 'Detak Jantung Janin',
        'Pemberian Fe', 'Jenis PMT', 'Keluhan', 'Tindakan', 'Konseling',
        'Posyandu', 'RW', 'Kelurahan'
      ]],
      body: filteredData.map((item: any, idx: number) => {
        const ibu = item.ibu;
        return [
          idx + 1,
          item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '-',
          ibu.nik ?? '-',
          ibu.nama ?? '-',
          ibu.noKK ?? '-',
          ibu.tanggalLahir ? new Date(ibu.tanggalLahir).toLocaleDateString('id-ID') : '-',
          ibu.BBSH ?? '-',
          ibu.TBSH ?? '-',
          ibu.liLA ?? '-',
          ibu.IMTSH ?? '-',
          ibu.StatusGiziKEK ?? '-',
          ibu.tanggalHPHT ? new Date(ibu.tanggalHPHT).toLocaleDateString('id-ID') : '-',
          ibu.tanggalHPL ? new Date(ibu.tanggalHPL).toLocaleDateString('id-ID') : '-',
          item.usiaKehamilan ?? '-',
          ibu.gravida ?? '-',
          ibu.para ?? '-',
          ibu.abortus ?? '-',
          item.beratBadan ?? '-',
          item.tekananDarah ?? '-',
          item.tinggiFundus ?? '-',
          item.detakJantungJanin ?? '-',
          item.pemberianFe ? 'Ya' : 'Tidak',
          item.jenisPmt ?? '-',
          item.keluhan ?? '-',
          item.tindakan ?? '-',
          item.konseling ?? '-',
          ibu.posyandu?.nama ?? '-',
          ibu.posyandu?.wilayah ?? '-',
          ibu.posyandu?.kelurahan?.nama ?? '-'
        ];
      }),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [16, 185, 129], halign: 'center' },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(9);
    doc.text(`Tanggal Cetak: ${now.toLocaleString('id-ID')}`, 40, finalY);

    doc.save(`Laporan_Pemeriksaan_IbuHamil_${now.toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-2xl font-bold">Laporan Pemeriksaan Ibu Hamil</h2>
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
          {Array.from(new Set(ibuHamil.map((d) => d.posyandu.kelurahan.nama))).map(
            (kel) => <option key={kel} value={kel}>{kel}</option>
          )}
        </select>

        <select
          value={filterPosyandu}
          onChange={(e) => setFilterPosyandu(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Semua Posyandu</option>
          {Array.from(new Set(ibuHamil.map((d) => d.posyandu.nama))).map(
            (pos) => <option key={pos} value={pos}>{pos}</option>
          )}
        </select>

        <select
          value={filterRW}
          onChange={(e) => setFilterRW(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Semua RW</option>
          {Array.from(new Set(ibuHamil.map((d) => d.posyandu.wilayah))).map(
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
              <th className="p-2 border">NIK</th>
              <th className="p-2 border">Nama Ibu hamil</th>
              <th className="p-2 border">Tanggal Lahir</th>
              <th className="p-2 border">BB Sebelum Hamil (kg)</th>
              <th className="p-2 border">TB Sebelum Hamil (cm)</th>
              <th className="p-2 border">LiLA (cm)</th>
              <th className="p-2 border">IMT Trimester 1</th>
              <th className="p-2 border">Status Gizi KEK</th>
              <th className="p-2 border">HPHT</th>
              <th className="p-2 border">HPL</th>
              <th className="p-2 border">Usia Kehamilan</th>
              <th className="p-2 border">Gravida</th>
              <th className="p-2 border">Para</th>
              <th className="p-2 border">Abortus</th>
              <th className="p-2 border">Berat Badan (kg)</th>
              <th className="p-2 border">Tekanan Darah</th>
              <th className="p-2 border">Tinggi Fundus (cm)</th>
              <th className="p-2 border">Detak Jantung Janin</th>
              <th className="p-2 border">Pemberian Fe</th>
              <th className="p-2 border">Jenis PMT</th>
              <th className="p-2 border">Keluhan</th>
              <th className="p-2 border">Tindakan</th>
              <th className="p-2 border">Konseling</th>
              <th className="p-2 border">Posyandu</th>
              <th className="p-2 border">RW</th>
              <th className="p-2 border">Kelurahan</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={12} className="text-center p-6">
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
                <td className="p-2 border">{item.tanggal ? new Date(item.tanggal).toLocaleDateString() : '-'}</td>
                <td className="p-2 border">{item.ibu?.nik ?? '-'}</td>
                <td className="p-2 border">{item.ibu?.nama ?? '-'}</td>
                <td className="p-2 border">{item.ibu?.tanggalLahir ? new Date(item.ibu?.tanggalLahir).toLocaleDateString() : '-'}</td>
                <td className="p-2 border">{item.ibu?.BBSH ?? '-'}</td>
                <td className="p-2 border">{item.ibu?.TBSH ?? '-'}</td>
                <td className="p-2 border">{item.ibu?.liLA ?? '-'}</td>
                <td className="p-2 border">{item.ibu?.IMTSH ?? '-'}</td>
                <td className="p-2 border">{item.ibu?.StatusGiziKEK ?? '-'}</td>
                <td className="p-2 border">{item.ibu?.tanggalHPHT ? new Date(item.ibu?.tanggalHPHT).toLocaleDateString() : '-'}</td>
                <td className="p-2 border">{item.ibu?.tanggalHPL ? new Date(item.ibu?.tanggalHPL).toLocaleDateString() : '-'}</td>
                <td className="p-2 border">{item.usiaKehamilan ?? '-'}</td>
                <td className="p-2 border">{item.ibu?.gravida ?? '-'}</td>
                <td className="p-2 border">{item.ibu?.para ?? '-'}</td>
                <td className="p-2 border">{item.ibu?.abortus ?? '-'}</td>
                <td className="p-2 border">{item.beratBadan ?? '-'}</td>
                <td className="p-2 border">{item.tekananDarah ?? '-'}</td>
                <td className="p-2 border">{item.tinggiFundus ?? '-'}</td>
                <td className="p-2 border">{item.detakJantungJanin ?? '-'}</td>
                <td className="p-2 border">{item.pemberianFe ? 'Ya' : 'Tidak'}</td>
                <td className="p-2 border">{item.jenisPmt ?? '-'}</td>
                <td className="p-2 border">{item.keluhan ?? '-'}</td>
                <td className="p-2 border">{item.tindakan ?? '-'}</td>
                <td className="p-2 border">{item.konseling ?? '-'}</td>
                <td className="p-2 border">{item.ibu?.posyandu?.nama ?? '-'}</td>
                <td className="p-2 border">{item.ibu?.posyandu?.wilayah ?? '-'}</td>
                <td className="p-2 border">{item.ibu?.posyandu?.kelurahan?.nama ?? '-'}</td>
              </tr>
            ))}

            {!loading && paginatedList.length === 0 && (
              <tr>
                <td colSpan={29} className="text-center p-4 text-gray-500">Tidak ada data</td>
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
