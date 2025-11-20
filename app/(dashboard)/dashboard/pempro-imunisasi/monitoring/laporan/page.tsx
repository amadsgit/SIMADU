"use client";

import { useEffect, useMemo, useState } from "react";
import TabsPane from "@/components/tab-pane-pemproImunisasi";

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
  balita: {
    id: number;
    nama: string;
    nik: string;
    tanggalLahir: string;
    alamat: string;
  };
  statusGizi: StatusGizi[];
}

interface Pelaksanaan {
  id: number;
  tanggalMulai?: string;
  tanggalSelesai?: string | null;
  status: StatusPelaksanaan;
  posyandu: { id: number; nama: string; wilayah?: string; kelurahan?: any };
  kader: { id: number; nama: string };
  jumlahBalita: number;
  catatanUmum?: string;
  pemeriksaanBalita: PemeriksaanBalita[];
}

/* ============================================================
   COMPONENT: Monitoring & Laporan Kegiatan Imunisasi
   ============================================================ */
export default function MonitoringImunisasiPage() {
  const [data, setData] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(true);

  // Pencarian + pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter tanggal
  const [filterType, setFilterType] = useState<"all" | "day" | "month" | "year">("all");
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Modal detail
  const [detailPelaksanaan, setDetailPelaksanaan] = useState<Pelaksanaan | null>(null);
  const [detailKegiatan, setDetailKegiatan] = useState<Kegiatan | null>(null);

  /* ============================================================
     FETCH DATA
     ============================================================ */
  useEffect(() => {
    setLoading(true);

    fetch("/api/pemproImunisasi/monitoring")
      .then((res) => res.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ============================================================
     FLATTEN ROWS
     ============================================================ */
  const flatRows = useMemo(() => {
    const rows: Array<{ kegiatan: Kegiatan; pelaksanaan: Pelaksanaan }> = [];

    data.forEach((k) => {
      if (!k.pelaksanaan || k.pelaksanaan.length === 0) {
        rows.push({
          kegiatan: k,
          pelaksanaan: {
            id: -k.id,
            tanggalMulai: k.tanggalPelaksanaan,
            tanggalSelesai: null,
            status: "belum_mulai",
            posyandu: k.posyandu,
            kader: { id: 0, nama: "-" },
            jumlahBalita: 0,
            pemeriksaanBalita: [],
          },
        });
      } else {
        k.pelaksanaan.forEach((p) => rows.push({ kegiatan: k, pelaksanaan: p }));
      }
    });

    return rows;
  }, [data]);

  /* ============================================================
     FILTER + SEARCH
     ============================================================ */
  const filteredRows = useMemo(() => {
    const q = search.toLowerCase();

    const matchesSearch = (row: { kegiatan: Kegiatan; pelaksanaan: Pelaksanaan }) => {
      if (!q) return true;

      return (
        row.kegiatan.nama?.toLowerCase().includes(q) ||
        row.kegiatan.deskripsi?.toLowerCase().includes(q) ||
        row.kegiatan.posyandu?.nama?.toLowerCase().includes(q) ||
        row.pelaksanaan.kader?.nama?.toLowerCase().includes(q)
      );
    };

    const matchesFilter = (row: { kegiatan: Kegiatan; pelaksanaan: Pelaksanaan }) => {
      if (filterType === "all") return true;

      const dateStr = row.pelaksanaan.tanggalMulai ?? row.kegiatan.tanggalPelaksanaan;
      if (!dateStr) return false;

      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");

      if (filterType === "day") return `${yyyy}-${mm}-${dd}` === filterDay;
      if (filterType === "month") return `${yyyy}-${mm}` === filterMonth;
      if (filterType === "year") return String(yyyy) === filterYear;

      return true;
    };

    return flatRows.filter((r) => matchesSearch(r) && matchesFilter(r));
  }, [flatRows, search, filterType, filterDay, filterMonth, filterYear]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages]);

  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ============================================================
     PRINT FUNCTION
     ============================================================ */
  function escapeHtml(str: any) {
    if (str == null) return "";
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function printRows(
    rowsToPrint: Array<{ kegiatan: Kegiatan; pelaksanaan: Pelaksanaan }>,
    title = "Laporan Kegiatan Imunisasi"
  ) {
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return alert("Izinkan popup untuk mencetak!");

    const now = new Date();

    const header = `
    <h1>UPTD PUSKESMAS CIKALAPA</h1>
    <h2>${title}</h2>
    <div style="font-size:12px;color:#444">Dicetak: ${now.toLocaleString()}</div>
      <br>
    `;

    const rowsHtml = rowsToPrint
      .map((r, i) => {
        const tanggal = r.pelaksanaan.tanggalMulai ?? r.kegiatan.tanggalPelaksanaan ?? "-";
        const tgl = tanggal ? new Date(tanggal).toLocaleString("id-ID") : "-";

        return `
          <tr>
            <td>${i + 1}</td>
            <td>${tgl}</td>
            <td>${escapeHtml(r.kegiatan.nama)}</td>
            <td>${escapeHtml(r.kegiatan.posyandu?.nama)}</td>
            <td>${escapeHtml(r.kegiatan.programKesehatan?.nama)}</td>
            <td>${escapeHtml(r.pelaksanaan.kader?.nama ?? "-")}</td>
            <td style="text-align:center">${r.pelaksanaan.jumlahBalita}</td>
          </tr>
        `;
      })
      .join("");

    win.document.write(`
      <html>
        <body>
          ${header}
          <table border="1" cellpadding="6" cellspacing="0" width="100%">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Kegiatan</th>
                <th>Posyandu</th>
                <th>Program</th>
                <th>Kader</th>
                <th>Jumlah Balita</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `);

    win.document.close();
    setTimeout(() => win.print(), 300);
  }

  /* ============================================================
     BADGE
     ============================================================ */
  const StatusBadge = ({ status }: { status: StatusPelaksanaan }) => {
    const color = {
      belum_mulai: "bg-gray-100 text-gray-700",
      berjalan: "bg-yellow-100 text-yellow-800",
      selesai: "bg-green-100 text-green-800",
    }[status];

    return <span className={`px-2 py-1 rounded-full text-xs ${color}`}>{status}</span>;
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Monitoring & Laporan Kegiatan Imunisasi</h1>

      <TabsPane />

      <div className="bg-white shadow rounded p-4">
        {/* FILTER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Cari kegiatan, posyandu, kader..."
              className="border rounded px-3 py-2 w-64"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />

            <select
              className="border rounded px-3 py-2"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="all">Semua</option>
              <option value="day">Per Hari</option>
              <option value="month">Per Bulan</option>
              <option value="year">Per Tahun</option>
            </select>

            {filterType === "day" && (
              <input
                type="date"
                className="border rounded px-3 py-2"
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
              />
            )}

            {filterType === "month" && (
              <input
                type="month"
                className="border rounded px-3 py-2"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              />
            )}

            {filterType === "year" && (
              <input
                type="number"
                className="border rounded px-3 py-2 w-28"
                placeholder="2025"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              />
            )}
          </div>

          {/* PRINT BUTTON */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => printRows(filteredRows, "Laporan Kegiatan Imunisasi (Filter)")}
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
            >
              Print PDF (Filter)
            </button>

            <button
              onClick={() => printRows(flatRows, "Semua Kegiatan Imunisasi")}
              className="bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-800"
            >
              Print Semua
            </button>
          </div>
        </div>

        {/* TABEL */}
        <div className="overflow-x-auto mt-4">
          {loading ? (
            <div className="p-6 text-center text-green-500">Memuat data...</div>
          ) : filteredRows.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Tidak ada data untuk filter ini.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Kegiatan</th>
                  <th className="px-4 py-3">Posyandu</th>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Kader</th>
                  <th className="px-4 py-3 text-center">Balita</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedRows.map((r, idx) => {
                  const date = r.pelaksanaan.tanggalMulai ?? r.kegiatan.tanggalPelaksanaan;
                  return (
                    <tr key={`${r.kegiatan.id}-${r.pelaksanaan.id}`}>
                      <td className="px-4 py-3">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="px-4 py-3">
                        {date
                          ? new Date(date).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                      <td className="px-4 py-3">{r.kegiatan.nama}</td>
                      <td className="px-4 py-3">{r.kegiatan.posyandu?.nama}</td>
                      <td className="px-4 py-3">{r.kegiatan.programKesehatan?.nama}</td>
                      <td className="px-4 py-3">{r.pelaksanaan.kader?.nama ?? "-"}</td>
                      <td className="px-4 py-3 text-center">{r.pelaksanaan.jumlahBalita}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.pelaksanaan.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setDetailKegiatan(r.kegiatan);
                              setDetailPelaksanaan(r.pelaksanaan);
                            }}
                            className="px-2 py-1 text-white bg-emerald-500 rounded hover:bg-emerald-600"
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => printRows([r], `Laporan - ${r.kegiatan.nama}`)}
                            className="px-2 py-1 text-white bg-rose-500 rounded hover:bg-rose-600"
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
