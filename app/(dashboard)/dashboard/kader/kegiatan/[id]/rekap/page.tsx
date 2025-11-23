'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ClipboardCheckIcon,
  BabyIcon,
  HeartPulseIcon,
  EyeIcon,
} from 'lucide-react';
import Link from 'next/link';
import TabsPane from '@/components/tab-pane-kegiatan';
import Search from '@/app/ui/search';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';


interface Rekap {
  tanggal: string;
  posyanduId: number;
  namaPosyandu: string;
  wilayahPosyandu: string;
  kelurahan: string;
  namaKader: string;
  jumlahBalita: number;
  jumlahIbuHamil: number;
  totalPemeriksaan: number;
}

interface PemeriksaanBalita {
  id: number;
  tanggal: string;
  beratBadan: number;
  tinggiBadan: number;
  imunisasi?: string;
  vitamin?: boolean;
  jenisVitamin?: string;
  pmt?: boolean;
  jenisPmt?: string;
  keluhan?: string;
  tindakan?: string;
  balita: {
    id: number;
    nama: string;
    nik: string;
    tanggalLahir: string;
    jenisKelamin: string;
    namaAyah: string;
    namaIbu: string;
    alamat: string;
  };
  kegiatan: {
    id: number;
    nama: string;
    programKesehatan: { id: number; nama: string };
  };
}

interface PemeriksaanIbuHamil {
  id: number;
  tanggal: string;
  usiaKehamilan: number;
  beratBadan?: number;
  tekananDarah?: string;
  tinggiFundus?: string;
  detakJantungJanin?: string;
  pemberianFe?: boolean;
  pmt?: boolean;
  jenisPmt?: string;
  keluhan?: string;
  tindakan?: string;
  konseling?: string;
  ibuHamil: {
    id: number;
    nama: string;
    nik: string;
    tanggalLahir: string;
    alamat: string;
    tanggalHPHT?: string;
    tanggalHPL?: string;
    gravida?: string;
    para?: string;
    abortus?: string;
  };
  kegiatan: {
    id: number;
    nama: string;
    programKesehatan: { id: number; nama: string };
  };
}

export default function RekapPage() {
  const { id } = useParams();
  const [rekap, setRekap] = useState<Rekap | null>(null);
  const [pemeriksaanBalita, setPemeriksaanBalita] = useState<PemeriksaanBalita[]>([]);
  const [pemeriksaanIbuHamil, setPemeriksaanIbuHamil] = useState<PemeriksaanIbuHamil[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [pageBalita, setPageBalita] = useState(1);
  const [pageIbu, setPageIbu] = useState(1);
  const itemsPerPage = 5;

  // FETCH DATA
  useEffect(() => {
    const fetchRekap = async () => {
      try {
        const res = await fetch(`/api/kader/kegiatan/${id}/pelaksanaan/pemeriksaan/rekap`);
        if (!res.ok) throw new Error('Gagal mengambil data rekap');
        const data = await res.json();

        setRekap(data.rekap);
        setPemeriksaanBalita(data.pemeriksaanBalita);
        setPemeriksaanIbuHamil(data.pemeriksaanIbuHamil);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRekap();
  }, [id]);

  // FILTERING
  const filteredBalita = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return pemeriksaanBalita.filter((p) => p.balita.nama.toLowerCase().includes(q));
  }, [pemeriksaanBalita, searchQuery]);

  const filteredIbu = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return pemeriksaanIbuHamil.filter((p) => p.ibuHamil.nama.toLowerCase().includes(q));
  }, [pemeriksaanIbuHamil, searchQuery]);

  // PAGINATION
  const totalPagesBalita = Math.ceil(filteredBalita.length / itemsPerPage);
  const totalPagesIbu = Math.ceil(filteredIbu.length / itemsPerPage);
  const paginatedBalita = filteredBalita.slice(
    (pageBalita - 1) * itemsPerPage,
    pageBalita * itemsPerPage
  );
  const paginatedIbu = filteredIbu.slice(
    (pageIbu - 1) * itemsPerPage,
    pageIbu * itemsPerPage
  );


  // CETAK PDF BALITA (Lengkap)
  const handlePrintBalita = () => {
    const doc = new jsPDF('l', 'pt', 'a4');

    // === HEADER LAPORAN ===
    doc.setFontSize(14);
    doc.text('UPTD PUSKESMAS CIKALAPA', 40, 30);

    doc.setFontSize(10);
    doc.text(`Tanggal Pemeriksaan: ${rekap?.tanggal}`, 40, 50);
    doc.text(`Laporan Kegiatan: ${pemeriksaanBalita[0]?.kegiatan?.nama || '-'}`, 40, 65);
    doc.text(`Program Kesehatan: ${pemeriksaanBalita[0]?.kegiatan?.programKesehatan?.nama || '-'}`, 40, 80);
    doc.text(`Nama Posyandu: ${rekap?.namaPosyandu || '-'} (${rekap?.wilayahPosyandu || '-'})`, 40, 95);
    doc.text(`Kelurahan: ${rekap?.kelurahan || '-'}`, 40, 110);
    doc.text(`Nama Kader: ${rekap?.namaKader}`, 40, 125);

    // === TABEL DATA PEMERIKSAAN ===
    autoTable(doc, {
      startY: 140,
      head: [[
        'No', 'Nama Balita', 'NIK', 'Tanggal Lahir', 'Jenis Kelamin', 'Nama Ayah', 'Nama Ibu', 'Alamat',
        'Tanggal Pemeriksaan', 'Berat Badan (kg)', 'Tinggi Badan (cm)', 'Imunisasi',
        'Vitamin', 'Jenis Vitamin', 'PMT', 'Jenis PMT', 'Keluhan', 'Tindakan'
      ]],
      body: pemeriksaanBalita.map((p, i) => [
        i + 1,
        p.balita?.nama || '-',
        p.balita?.nik || '-',
        new Date(p.balita?.tanggalLahir).toLocaleDateString('id-ID'),
        p.balita?.jenisKelamin || '-',
        p.balita?.namaAyah || '-',
        p.balita?.namaIbu || '-',
        p.balita?.alamat || '-',
        new Date(p.tanggal).toLocaleDateString('id-ID'),
        p.beratBadan || '-',
        p.tinggiBadan || '-',
        p.imunisasi || '-',
        p.vitamin ? 'Ya' : 'Tidak',
        p.vitamin ? p.jenisVitamin || '-' : '-',
        p.pmt ? 'Ya' : 'Tidak',
        p.pmt ? p.jenisPmt || '-' : '-',
        p.keluhan || '-',
        p.tindakan || '-',
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [16, 185, 129] },
    });

    // === FOOTER ===
    const finalY = (doc as any).lastAutoTable.finalY + 30;
    doc.setFontSize(9);
    doc.text(`Dicetak oleh: ${rekap?.namaKader}`, 40, finalY);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`, 40, finalY + 15);

    // === SIMPAN PDF ===
    doc.save(`Laporan_kegiatan_posyandu_balita_${rekap?.tanggal}.pdf`);
  };
  // DOWNLOAD EXCEL BALITA
  const handleDownloadBalita = () => {
    // === HEADER LAPORAN ===
    const headerInfo = [
      ['UPTD PUSKESMAS CIKALAPA'],
      ['Laporan Kegiatan Posyandu'],
      [],
      ['Tanggal Pemeriksaan', rekap?.tanggal || '-'],
      ['Laporan Kegiatan', pemeriksaanBalita[0]?.kegiatan?.nama || '-'],
      ['Program Kesehatan', pemeriksaanBalita[0]?.kegiatan?.programKesehatan?.nama || '-'],
      ['Nama Posyandu', `${rekap?.namaPosyandu || '-'} (${rekap?.wilayahPosyandu || '-'})`],
      ['Kelurahan', rekap?.kelurahan || '-'],
      ['Nama Kader', rekap?.namaKader || '-'],
      [],
    ];

    // === DATA TABEL ===
    const dataRows = pemeriksaanBalita.map((p, i) => ({
      No: i + 1,
      'Nama Balita': p.balita?.nama || '-',
      NIK: p.balita?.nik || '-',
      'Tanggal Lahir': p.balita?.tanggalLahir
        ? new Date(p.balita.tanggalLahir).toLocaleDateString('id-ID')
        : '-',
      'Jenis Kelamin': p.balita?.jenisKelamin || '-',
      'Nama Ayah': p.balita?.namaAyah || '-',
      'Nama Ibu': p.balita?.namaIbu || '-',
      Alamat: p.balita?.alamat || '-',
      'Tanggal Pemeriksaan': new Date(p.tanggal).toLocaleDateString('id-ID'),
      'Berat Badan (kg)': p.beratBadan || '-',
      'Tinggi Badan (cm)': p.tinggiBadan || '-',
      Imunisasi: p.imunisasi || '-',
      Vitamin: p.vitamin ? 'Ya' : 'Tidak',
      'Jenis Vitamin': p.vitamin ? p.jenisVitamin || '-' : '-',
      PMT: p.pmt ? 'Ya' : 'Tidak',
      'Jenis PMT': p.pmt ? p.jenisPmt || '-' : '-',
      Keluhan: p.keluhan || '-',
      Tindakan: p.tindakan || '-',
    }));

    // === HEADER + DATA ===
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, headerInfo); // header laporan
    XLSX.utils.sheet_add_json(ws, dataRows, { origin: 'A12' }); // data mulai dari baris ke-12

    // === AUTO WIDTH ===
    const colWidths = Object.keys(dataRows[0] || {}).map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    // === FOOTER ===
    const footerStartRow = dataRows.length + 14;
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [],
        [`Dicetak oleh: ${rekap?.namaKader || '-'}`],
        [`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`],
      ],
      { origin: `A${footerStartRow}` }
    );

    // === SIMPAN FILE ===
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Posyandu Balita');
    XLSX.writeFile(wb, `Laporan_kegiatan_posyandu_balita_${rekap?.tanggal}.xlsx`);
  };

  // CETAK PDF IBU HAMIL (Lengkap)
  const handlePrintIbu = () => {
    const doc = new jsPDF('l', 'pt', 'a4');

    // === Header Laporan ===
    doc.setFontSize(14);
    doc.text('UPTD PUSKESMAS CIKALAPA', 40, 30);

    doc.setFontSize(10);
    doc.text(`Tanggal Pemeriksaan: ${rekap?.tanggal}`, 40, 50);
    doc.text(`Laporan Kegiatan: ${pemeriksaanIbuHamil[0]?.kegiatan?.nama || '-'}`, 40, 65);
    doc.text(`Program Kesehatan: ${pemeriksaanIbuHamil[0]?.kegiatan?.programKesehatan?.nama || '-'}`, 40, 80);
    doc.text(`Nama Posyandu: ${rekap?.namaPosyandu || '-'} (${rekap?.wilayahPosyandu || '-'})`, 40, 95);
    doc.text(`Kelurahan: ${rekap?.kelurahan || '-'}`, 40, 110);
    doc.text(`Nama Kader: ${rekap?.namaKader}`, 40, 125);

    // === Tabel Data Pemeriksaan ===
    autoTable(doc, {
      startY: 140,
      head: [[
        'No', 'Nama Ibu Hamil', 'NIK', 'Tanggal Lahir', 'Usia Kehamilan (mg)',
        'Berat Badan (kg)', 'Tekanan Darah', 'Tinggi Fundus (cm)',
        'Detak Jantung Janin', 'Pemberian Fe', 'PMT', 'Jenis PMT',
        'Keluhan', 'Tindakan', 'Konseling'
      ]],
      body: pemeriksaanIbuHamil.map((p, i) => [
        i + 1,
        p.ibuHamil?.nama || '-',
        p.ibuHamil?.nik || '-',
        new Date(p.ibuHamil?.tanggalLahir).toLocaleDateString('id-ID'),
        p.usiaKehamilan || '-',
        p.beratBadan || '-',
        p.tekananDarah || '-',
        p.tinggiFundus || '-',
        p.detakJantungJanin || '-',
        p.pemberianFe ? 'Ya' : 'Tidak',
        p.pmt ? 'Ya' : 'Tidak',
        p.jenisPmt || '-',
        p.keluhan || '-',
        p.tindakan || '-',
        p.konseling || '-',
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [230, 57, 70] },
    });

    // === FOOTER ===
    const finalY = (doc as any).lastAutoTable.finalY + 30;
    doc.setFontSize(9);
    doc.text(`Dicetak oleh: ${rekap?.namaKader}`, 40, finalY);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`, 40, finalY + 15);

    doc.save(`Laporan_kegiatan_posyandu_ibuhamil_${rekap?.tanggal}.pdf`);
  };
  // DOWNLOAD EXCEL IBU HAMIL
  const handleDownloadIbu = () => {
    // Header Laporan
    const headerInfo = [
      ['UPTD PUSKESMAS CIKALAPA'],
      ['Laporan Kegiatan Posyandu'],
      [],
      ['Tanggal Pemeriksaan', rekap?.tanggal || '-'],
      ['Laporan Kegiatan', pemeriksaanIbuHamil[0]?.kegiatan?.nama || '-'],
      ['Program Kesehatan', pemeriksaanIbuHamil[0]?.kegiatan?.programKesehatan?.nama || '-'],
      ['Nama Posyandu', `${rekap?.namaPosyandu || '-'} (${rekap?.wilayahPosyandu || '-'})`],
      ['Kelurahan', rekap?.kelurahan || '-'],
      ['Nama Kader', rekap?.namaKader || '-'],
      [],
    ];

    // Data tabel sesuai PDF
    const dataRows = pemeriksaanIbuHamil.map((p, i) => ({
      No: i + 1,
      'Nama Ibu Hamil': p.ibuHamil?.nama || '-',
      NIK: p.ibuHamil?.nik || '-',
      'Tanggal Lahir': p.ibuHamil?.tanggalLahir
        ? new Date(p.ibuHamil.tanggalLahir).toLocaleDateString('id-ID')
        : '-',
      'Usia Kehamilan (mg)': p.usiaKehamilan || '-',
      'Berat Badan (kg)': p.beratBadan || '-',
      'Tekanan Darah': p.tekananDarah || '-',
      'Tinggi Fundus (cm)': p.tinggiFundus || '-',
      'Detak Jantung Janin': p.detakJantungJanin || '-',
      'Pemberian Fe': p.pemberianFe ? 'Ya' : 'Tidak',
      PMT: p.pmt ? 'Ya' : 'Tidak',
      'Jenis PMT': p.jenisPmt || '-',
      Keluhan: p.keluhan || '-',
      Tindakan: p.tindakan || '-',
      Konseling: p.konseling || '-',
    }));

    // header + tabel
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, headerInfo); // header laporan
    XLSX.utils.sheet_add_json(ws, dataRows, { origin: 'A12' }); // data tabel mulai dari baris ke-12

    // Auto width
    const colWidths = Object.keys(dataRows[0] || {}).map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    // footer 
    const footerStartRow = dataRows.length + 14;
    XLSX.utils.sheet_add_aoa(ws, [
      [],
      [`Dicetak oleh: ${rekap?.namaKader || '-'}`],
      [`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`],
    ], { origin: `A${footerStartRow}` });

    // Buat dan simpan workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Posyandu Ibu Hamil');
    XLSX.writeFile(wb, `Laporan_kegiatan_posyandu_ibuhamil_${rekap?.tanggal}.xlsx`);
  };

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
  if (!rekap)
    return <p className="p-4 text-red-500 text-center">Data rekap tidak ditemukan.</p>;

  return (
    <div>
      <TabsPane />

      {/* CARD REKAP */}
      <div className="max-w-full mx-auto bg-emerald-50 border border-emerald-200 shadow-sm hover:shadow-md transition rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-emerald-800 flex items-center gap-2">
            <ClipboardCheckIcon className="w-5 h-5" />
            Rekap Pemeriksaan Hari Ini
          </h2>
          <span className="text-sm text-gray-500">{rekap.tanggal}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700">
          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <BabyIcon className="w-4 h-4 text-emerald-600 mb-1" />
            <p className="font-semibold text-emerald-700">Balita Diperiksa</p>
            <p className="text-lg font-bold">{rekap.jumlahBalita}</p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <HeartPulseIcon className="w-4 h-4 text-rose-600 mb-1" />
            <p className="font-semibold text-rose-700">Ibu Hamil Diperiksa</p>
            <p className="text-lg font-bold">{rekap.jumlahIbuHamil}</p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <ClipboardCheckIcon className="w-4 h-4 text-indigo-600 mb-1" />
            <p className="font-semibold text-indigo-700">Total Pemeriksaan</p>
            <p className="text-lg font-bold">{rekap.totalPemeriksaan}</p>
          </div>
        </div>
      </div>

      {/* KOLOM PENCARIAN */}
      <div className="mb-4">
        <Search
          placeholder="Cari nama balita atau ibu hamil..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* TABEL BALITA */}
      {paginatedBalita.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-3 border-b border-gray-100 flex items-center gap-2">
            <BabyIcon className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-emerald-700">Daftar Pemeriksaan Balita</h3>
            <div className="ml-auto flex gap-2">
              <button
                onClick={handlePrintBalita}
                className="px-3 py-1.5 text-xs bg-rose-600 text-white rounded-md hover:bg-rose-700 transition"
              >
                Print PDF
              </button>
              <button
                onClick={handleDownloadBalita}
                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Download Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-emerald-50">
                <tr>
                  <th className="px-4 py-2 text-left">No</th>
                  <th className="px-4 py-2 text-left">Nama Balita</th>
                  <th className="px-4 py-2 text-left">Tanggal</th>
                  <th className="px-4 py-2 text-left">Berat</th>
                  <th className="px-4 py-2 text-left">Tinggi</th>
                  <th className="px-4 py-2 text-left">Imunisasi</th>
                  <th className="px-4 py-2 text-left">Vitamin</th>
                  <th className="px-4 py-2 text-left">PMT</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBalita.map((p, index) => (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {(pageBalita - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-2 font-semibold">{p.balita?.nama || '-'}</td>
                    <td className="px-4 py-2">
                      {new Date(p.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-2">{p.beratBadan ? `${p.beratBadan} kg` : '-'}</td>
                    <td className="px-4 py-2">{p.tinggiBadan ? `${p.tinggiBadan} cm` : '-'}</td>
                    <td className="px-4 py-2">{p.imunisasi || '-'}</td>
                    <td className="px-4 py-2">{p.vitamin ? p.jenisVitamin || 'Ya' : '-'}</td>
                    <td className="px-4 py-2">{p.pmt ? p.jenisPmt || 'Ya' : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Balita */}
          {totalPagesBalita > 1 && (
            <div className="flex justify-end items-center gap-2 p-4">
              <button
                disabled={pageBalita === 1}
                onClick={() => setPageBalita((prev) => prev - 1)}
                className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm">
                Hal {pageBalita} dari {totalPagesBalita}
              </span>
              <button
                disabled={pageBalita === totalPagesBalita}
                onClick={() => setPageBalita((prev) => prev + 1)}
                className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* TABEL IBU HAMIL */}
      {paginatedIbu.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-3 border-b border-gray-100 flex items-center gap-2">
            <HeartPulseIcon className="w-5 h-5 text-rose-600" />
            <h3 className="font-semibold text-rose-700">Daftar Pemeriksaan Ibu Hamil</h3>
            <div className="ml-auto flex gap-2">
              <button
                onClick={handlePrintIbu}
                className="px-3 py-1.5 text-xs bg-rose-600 text-white rounded-md hover:bg-rose-700 transition"
              >
                Print PDF
              </button>
              <button
                onClick={handleDownloadIbu}
                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Download Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-rose-50">
                <tr>
                  <th className="px-4 py-2 text-left">No</th>
                  <th className="px-4 py-2 text-left">Nama Ibu Hamil</th>
                  <th className="px-4 py-2 text-left">Tanggal</th>
                  <th className="px-4 py-2 text-left">Usia Kehamilan</th>
                  <th className="px-4 py-2 text-left">Berat Badan</th>
                  <th className="px-4 py-2 text-left">Tekanan Darah</th>
                  <th className="px-4 py-2 text-left">PMT</th>
                </tr>
              </thead>
              <tbody>
                {paginatedIbu.map((p, index) => (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {(pageIbu - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-2 font-semibold">{p.ibuHamil?.nama || '-'}</td>
                    <td className="px-4 py-2">
                      {new Date(p.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-2">{p.usiaKehamilan} minggu</td>
                    <td className="px-4 py-2">{p.beratBadan ? `${p.beratBadan} kg` : '-'}</td>
                    <td className="px-4 py-2">{p.tekananDarah || '-'}</td>
                    <td className="px-4 py-2">{p.pmt ? p.jenisPmt || 'Ya' : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Ibu */}
          {totalPagesIbu > 1 && (
            <div className="flex justify-end items-center gap-2 p-4">
              <button
                disabled={pageIbu === 1}
                onClick={() => setPageIbu((prev) => prev - 1)}
                className="px-3 py-1 rounded-md bg-teal-500 hover:bg-teal-200 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm">
                Hal {pageIbu} dari {totalPagesIbu}
              </span>
              <button
                disabled={pageIbu === totalPagesIbu}
                onClick={() => setPageIbu((prev) => prev + 1)}
                className="px-3 py-1 rounded-md bg-teal-500 hover:bg-teal-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
