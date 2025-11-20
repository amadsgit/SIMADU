"use client";

import { useEffect, useMemo, useState } from "react";
import TabsPane from '@/components/tab-pane-pemproKia';

type StatusPelaksanaan = "belum_mulai" | "berjalan" | "selesai";

interface Kegiatan {
  id: number;
  nama: string;
  deskripsi?: string;
  tanggalPelaksanaan?: string;
  alamat?: string;
  posyandu: { id: number; nama: string; wilayah: string; kelurahan: any };
  programKesehatan: { id: number; nama: string };
  pelaksanaan: Pelaksanaan[];
}

interface StatusGizi {
  id: number;
  tanggal: string;
  beratBadan: number;
  tinggiBadan: number;
  zScoreBBU?: number;
  zScoreTBU?: number;
  zScoreBBTB?: number;
  kategoriGizi?: string;
  statusStunting?: string;
}

interface PemeriksaanBalita {
  id: number;
  tanggal: string;
  beratBadan: number;
  tinggiBadan: number;
  lingkarKepala: number;
  imunisasi: string;
  vitamin: string | boolean;
  jenisVitamin: string;
  pmt: string | boolean;
  jenisPmt: string;
  keluhan: string;
  tindakan: string;
  catatan: string;
  balita: { id: number; nama: string; nik: string; tanggalLahir: string; alamat: string };
  statusGizi: StatusGizi[];
}

interface PemeriksaanIbuHamil {
  id: number;
  tanggal: string;
  usiaKehamilan: number;
  beratBadan?: number;
  tekananDarah: any;
  tinggiFundus: number;
  detakJantungJanin: number;
  pemberianFe: boolean;
  jenisPmt: string;
  keluhan: string;
  tindakan: string;
  konseling: string;
  ibuHamil: {
    id: number;
    nama: string;
    nik: string;
    noKK: string;
    tanggalLahir: string;
    umurKehamilanAwal: number;
    tanggalHPHT: string;
    tanggalHPL: string;
    gravida: number;
    para: number;
    abortus: number;
    alamat: string;
  };
}

interface Pelaksanaan {
  id: number;
  tanggalMulai?: string;
  tanggalSelesai?: string | null;
  status: StatusPelaksanaan;
  posyandu: { id: number; nama: string; wilayah?: string; kelurahan?: any };
  kader: { id: number; nama: string };
  jumlahBalita: number;
  jumlahIbuHamil: number;
  catatanUmum?: string;
  pemeriksaanBalita: PemeriksaanBalita[];
  pemeriksaanIbuHamil: PemeriksaanIbuHamil[];
}

/**
 * Monitoring & Laporan KIA Page
 */
export default function MonitoringKIAPage() {
  const [data, setData] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [filterType, setFilterType] = useState<"all" | "day" | "month" | "year">("all");
  const [filterDay, setFilterDay] = useState<string>(""); // yyyy-mm-dd
  const [filterMonth, setFilterMonth] = useState<string>(""); // yyyy-mm
  const [filterYear, setFilterYear] = useState<string>(""); // yyyy

  // modal detail
  const [detailPelaksanaan, setDetailPelaksanaan] = useState<Pelaksanaan | null>(null);
  const [detailKegiatan, setDetailKegiatan] = useState<Kegiatan | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/pemproKia/monitoring")
      .then((res) => res.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) setData(res.data);
      })
      .catch((err) => {
        console.error("fetch monitoring error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Helper get all pelaksanaan rows
  const flatRows = useMemo(() => {
    const rows: Array<{ kegiatan: Kegiatan; pelaksanaan: Pelaksanaan }> = [];
    data.forEach((k) => {
      if (!k.pelaksanaan || k.pelaksanaan.length === 0) {

        rows.push({
          kegiatan: k,
          pelaksanaan: {
            id: -k.id,
            tanggalMulai: k.tanggalPelaksanaan ?? undefined,
            tanggalSelesai: null,
            status: "belum_mulai",
            posyandu: k.posyandu,
            kader: { id: 0, nama: "-" },
            jumlahBalita: 0,
            jumlahIbuHamil: 0,
            pemeriksaanBalita: [],
            pemeriksaanIbuHamil: [],
          },
        });
      } else {
        k.pelaksanaan.forEach((p) => rows.push({ kegiatan: k, pelaksanaan: p }));
      }
    });
    return rows;
  }, [data]);

  // Apply search + filterType
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matchesSearch = (row: { kegiatan: Kegiatan; pelaksanaan: Pelaksanaan }) => {
      if (!q) return true;
      if (row.kegiatan.nama?.toLowerCase().includes(q)) return true;
      if (row.kegiatan.deskripsi?.toLowerCase().includes(q)) return true;
      if (row.kegiatan.posyandu?.nama?.toLowerCase().includes(q)) return true;
      if (row.pelaksanaan.kader?.nama?.toLowerCase().includes(q)) return true;
      return false;
    };

    const matchesFilter = (row: { kegiatan: Kegiatan; pelaksanaan: Pelaksanaan }) => {
      if (filterType === "all") return true;

      const dateStr = row.pelaksanaan.tanggalMulai ?? row.kegiatan.tanggalPelaksanaan;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;

      if (filterType === "day") {
        if (!filterDay) return true;
        // compare yyyy-mm-dd
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}` === filterDay;
      }

      if (filterType === "month") {
        if (!filterMonth) return true;
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        return `${yyyy}-${mm}` === filterMonth;
      }

      if (filterType === "year") {
        if (!filterYear) return true;
        return String(d.getFullYear()) === filterYear;
      }

      return true;
    };

    return flatRows.filter((r) => matchesSearch(r) && matchesFilter(r));
  }, [flatRows, search, filterType, filterDay, filterMonth, filterYear]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const paginatedRows = filteredRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Print/export: open new window with printable HTML and call print()
  function printRows(rowsToPrint: Array<{ kegiatan: Kegiatan; pelaksanaan: Pelaksanaan }>, title = "Laporan Kegiatan KIA") {
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) {
      alert("Popup diblokir. Izinkan popup untuk mencetak atau gunakan fitur 'Save as PDF' di browser.");
      return;
    }

    const now = new Date();
    const headerHtml = `
      <div style="font-family: Arial, Helvetica, sans-serif; margin-bottom: 12px;">
        <h2 style="margin:0 0 6px 0;">${title}</h2>
        <div style="font-size:13px;color:#444">Dicetak: ${now.toLocaleString()}</div>
      </div>
    `;

    const tableRowsHtml = rowsToPrint.map((r, idx) => {
      const tanggal = r.pelaksanaan.tanggalMulai ?? r.kegiatan.tanggalPelaksanaan ?? "-";
      const tglFormatted = tanggal ? new Date(tanggal).toLocaleString() : "-";
      return `
        <tr>
          <td style="padding:6px;border:1px solid #ddd;text-align:center;">${idx + 1}</td>
          <td style="padding:6px;border:1px solid #ddd;">${tglFormatted}</td>
          <td style="padding:6px;border:1px solid #ddd;">${escapeHtml(r.kegiatan.nama)}</td>
          <td style="padding:6px;border:1px solid #ddd;">${escapeHtml(r.kegiatan.posyandu?.nama ?? "-")}</td>
          <td style="padding:6px;border:1px solid #ddd;">${escapeHtml(r.kegiatan.programKesehatan?.nama ?? "-")}</td>
          <td style="padding:6px;border:1px solid #ddd;">${escapeHtml(r.pelaksanaan.kader?.nama ?? "-")}</td>
          <td style="padding:6px;border:1px solid #ddd;text-align:center;">${r.pelaksanaan.jumlahBalita ?? 0}</td>
          <td style="padding:6px;border:1px solid #ddd;text-align:center;">${r.pelaksanaan.jumlahIbuHamil ?? 0}</td>
        </tr>
      `;
    }).join("");

    const html = `
      <html>
        <head>
          <title>${title}</title>
        </head>
        <body>
          ${headerHtml}
          <table style="border-collapse:collapse;width:100%;font-family: Arial, Helvetica, sans-serif;font-size:12px;">
            <thead>
              <tr>
                <th style="padding:8px;border:1px solid #ddd;background:#f2f2f2;">No</th>
                <th style="padding:8px;border:1px solid #ddd;background:#f2f2f2;">Tanggal</th>
                <th style="padding:8px;border:1px solid #ddd;background:#f2f2f2;">Kegiatan</th>
                <th style="padding:8px;border:1px solid #ddd;background:#f2f2f2;">Posyandu</th>
                <th style="padding:8px;border:1px solid #ddd;background:#f2f2f2;">Program</th>
                <th style="padding:8px;border:1px solid #ddd;background:#f2f2f2;">Kader</th>
                <th style="padding:8px;border:1px solid #ddd;background:#f2f2f2;"># Balita</th>
                <th style="padding:8px;border:1px solid #ddd;background:#f2f2f2;"># Ibu Hamil</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `;

    win.document.open();
    win.document.write(html);
    win.document.close();

    // wait a tick then print
    setTimeout(() => {
      win.focus();
      win.print();
      // don't close automatically; user may want to save
      // win.close();
    }, 500);
  }

  // utility to escape HTML
  function escapeHtml(s: any) {
    if (s === null || s === undefined) return "";
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  // badge
  const StatusBadge = ({ status }: { status: StatusPelaksanaan }) => {
    const map: Record<StatusPelaksanaan, string> = {
      belum_mulai: "bg-gray-100 text-gray-800",
      berjalan: "bg-yellow-100 text-yellow-800",
      selesai: "bg-green-100 text-green-800",
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status]}`}>{status}</span>;
  };

  // Render
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Monitoring & Laporan Kegiatan KIA</h1>

      <TabsPane />

      <div className="bg-white shadow rounded p-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Cari nama kegiatan, posyandu, kader..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="border rounded px-3 py-2 w-64 focus:outline-none focus:ring"
            />
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value as any); setCurrentPage(1); }}
              className="border rounded px-3 py-2"
            >
              <option value="all">Semua (tanpa filter)</option>
              <option value="day">Filter per Hari</option>
              <option value="month">Filter per Bulan</option>
              <option value="year">Filter per Tahun</option>
            </select>

            {filterType === "day" && (
              <input
                type="date"
                value={filterDay}
                onChange={(e) => { setFilterDay(e.target.value); setCurrentPage(1); }}
                className="border rounded px-3 py-2"
              />
            )}

            {filterType === "month" && (
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => { setFilterMonth(e.target.value); setCurrentPage(1); }}
                className="border rounded px-3 py-2"
              />
            )}

            {filterType === "year" && (
              <input
                type="number"
                placeholder="2025"
                value={filterYear}
                onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }}
                className="border rounded px-3 py-2 w-28"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => printRows(filteredRows, "Laporan Kegiatan KIA (Filter saat ini)") }
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
            >
              Print PDF (Filter saat ini)
            </button>

            <button
              onClick={() => printRows(filteredRows.length ? filteredRows : flatRows, "Laporan Kegiatan KIA (Semua Data)") }
              className="bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-800"
            >
              Print Semua
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          {loading ? (
            <div className="p-6 text-center text-green-500">Memuat data...</div>
          ) : filteredRows.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Belum ada data kegiatan untuk filter ini.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">No</th>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Kegiatan</th>
                  <th className="px-4 py-3 text-left">Posyandu</th>
                  <th className="px-4 py-3 text-left">Program</th>
                  <th className="px-4 py-3 text-left">Kader</th>
                  <th className="px-4 py-3 text-center">Balita</th>
                  <th className="px-4 py-3 text-center">Ibu Hamil</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedRows.map((r, idx) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                  const tanggal = r.pelaksanaan.tanggalMulai ?? r.kegiatan.tanggalPelaksanaan ?? "-";
                  return (
                    <tr key={`${r.kegiatan.id}-${r.pelaksanaan.id}-${idx}`}>
                      <td className="px-4 py-3">{globalIndex}</td>
                      <td className="px-4 py-3">
                        {tanggal ? new Date(tanggal).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        }) : "-"}
                      </td>
                      <td className="px-4 py-3 max-w-xs">{r.kegiatan.nama}</td>
                      <td className="px-4 py-3">{r.kegiatan.posyandu?.nama}</td>
                      <td className="px-4 py-3">{r.kegiatan.programKesehatan?.nama}</td>
                      <td className="px-4 py-3">{r.pelaksanaan.kader?.nama ?? "-"}</td>
                      <td className="px-4 py-3 text-center">{r.pelaksanaan.jumlahBalita ?? 0}</td>
                      <td className="px-4 py-3 text-center">{r.pelaksanaan.jumlahIbuHamil ?? 0}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.pelaksanaan.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setDetailKegiatan(r.kegiatan); setDetailPelaksanaan(r.pelaksanaan); }}
                            className="text-sm px-2 py-1 text-white border rounded bg-emerald-500 hover:bg-emerald-600"
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => printRows([r], `Laporan - ${r.kegiatan.nama}`)}
                            className="text-sm px-2 py-1 text-white border rounded bg-rose-500 hover:bg-rose-600"
                          >
                            Cetak
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredRows.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Menampilkan <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> -
              <strong> {Math.min(currentPage * itemsPerPage, filteredRows.length)}</strong> dari <strong>{filteredRows.length}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <div className="px-3 py-1 border rounded">Hal {currentPage} / {totalPages}</div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal (simple) */}
      {detailKegiatan && detailPelaksanaan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-3xl rounded shadow-lg overflow-auto max-h-[80vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <h3 className="font-semibold text-lg">{detailKegiatan.nama}</h3>
                <div className="text-sm text-gray-600">{detailKegiatan.posyandu?.nama} — {detailKegiatan.programKesehatan?.nama}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => printRows([{ kegiatan: detailKegiatan, pelaksanaan: detailPelaksanaan }], `Detail - ${detailKegiatan.nama}`)}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Cetak
                </button>
                <button onClick={() => { setDetailPelaksanaan(null); setDetailKegiatan(null); }} className="px-3 py-1 border rounded">
                  Tutup
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Tanggal Mulai</div>
                  <div className="font-medium">{detailPelaksanaan.tanggalMulai ? new Date(detailPelaksanaan.tanggalMulai).toLocaleString() : "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Tanggal Selesai</div>
                  <div className="font-medium">{detailPelaksanaan.tanggalSelesai ? new Date(detailPelaksanaan.tanggalSelesai).toLocaleString() : "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Kader</div>
                  <div className="font-medium">{detailPelaksanaan.kader?.nama ?? "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="font-medium"><StatusBadge status={detailPelaksanaan.status} /></div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Jumlah Balita</div>
                  <div className="font-medium">{detailPelaksanaan.jumlahBalita}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Jumlah Ibu Hamil</div>
                  <div className="font-medium">{detailPelaksanaan.jumlahIbuHamil}</div>
                </div>
              </div>

              {/* Pemeriksaan Ibu Hamil */}
              <div>
                <h4 className="font-semibold">Pemeriksaan Ibu Hamil ({detailPelaksanaan.pemeriksaanIbuHamil.length})</h4>
                {detailPelaksanaan.pemeriksaanIbuHamil.length === 0 ? (
                  <div className="text-sm text-gray-500">Tidak ada pemeriksaan ibu hamil.</div>
                ) : (
                  <div className="space-y-3 mt-2">
                    {detailPelaksanaan.pemeriksaanIbuHamil.map((pi) => (
                      <div key={pi.id} className="border rounded p-3">
                        <div className="text-sm text-gray-500">Tanggal: {new Date(pi.tanggal).toLocaleDateString()}</div>
                        <div className="font-medium">{pi.ibuHamil.nama} — usia kehamilan: {pi.usiaKehamilan} minggu</div>
                        <div className="text-sm mt-2 grid grid-cols-2 gap-2">
                          <div>Berat badan: {pi.beratBadan ?? "-"}</div>
                          <div>Tekanan darah: {String(pi.tekananDarah ?? "-")}</div>
                          <div>Tinggi fundus: {pi.tinggiFundus ?? "-"}</div>
                          <div>DTJ: {pi.detakJantungJanin ?? "-"}</div>
                          <div>Pemberian FE: {pi.pemberianFe ? "Ya" : "Tidak"}</div>
                          <div>PMT: {pi.jenisPmt ?? "-"}</div>
                        </div>
                        <div className="text-sm mt-2">Keluhan: {pi.keluhan}</div>
                        <div className="text-sm">Tindakan: {pi.tindakan}</div>
                        <div className="text-sm">Konseling: {pi.konseling}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pemeriksaan Balita */}
              <div>
                <h4 className="font-semibold">Pemeriksaan Balita ({detailPelaksanaan.pemeriksaanBalita.length})</h4>
                {detailPelaksanaan.pemeriksaanBalita.length === 0 ? (
                  <div className="text-sm text-gray-500">Tidak ada pemeriksaan balita.</div>
                ) : (
                  <div className="space-y-3 mt-2">
                    {detailPelaksanaan.pemeriksaanBalita.map((pb) => (
                      <div key={pb.id} className="border rounded p-3">
                        <div className="text-sm text-gray-500">Tanggal: {new Date(pb.tanggal).toLocaleDateString()}</div>
                        <div className="font-medium">{pb.balita.nama} — Lahir: {new Date(pb.balita.tanggalLahir).toLocaleDateString()}</div>
                        <div className="text-sm mt-2 grid grid-cols-3 gap-2">
                          <div>Berat: {pb.beratBadan} kg</div>
                          <div>Tinggi: {pb.tinggiBadan} cm</div>
                          <div>Lingkar Kepala: {pb.lingkarKepala} cm</div>
                        </div>
                        <div className="text-sm mt-2">Imunisasi: {pb.imunisasi}</div>
                        <div className="text-sm">Vitamin: {String(pb.vitamin)}</div>
                        <div className="text-sm">PMT: {String(pb.pmt)} ({pb.jenisPmt})</div>

                        {/* statusGizi */}
                        {pb.statusGizi && pb.statusGizi.length > 0 && (
                          <div className="mt-2 text-sm">
                            <div className="text-xs text-gray-500">Status Gizi (terakhir)</div>
                            <div className="font-medium">{pb.statusGizi[0].kategoriGizi ?? "-" } — {pb.statusGizi[0].statusStunting ?? ""}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
