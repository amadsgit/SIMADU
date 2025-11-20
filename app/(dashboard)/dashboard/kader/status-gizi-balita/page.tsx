"use client";

import { useEffect, useMemo, useState } from "react";
import PieGiziChart from "@/components/kader/PieGiziChart";
import BarZScoreChart from "@/components/kader/BarZScoreChart";
import { Search, Info } from "lucide-react";

/* ============================================================
   INTERFACES
============================================================ */

interface Pemeriksaan {
  id: number;
  balitaId: number;
  kegiatanId?: number | null;
  tanggal: string;
  beratBadan: number | null;
  tinggiBadan: number | null;
  lingkarKepala?: number | null;
  imunisasi?: string | null;
  vitamin?: boolean | null;
  jenisVitamin?: string | null;
  pmt?: boolean | null;
  jenisPmt?: string | null;
  keluhan?: string | null;
  tindakan?: string | null;
  catatan?: string | null;
  kaderId?: number | null;
  pelaksanaanKegiatanId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

interface StatusGizi {
  id: number;
  balitaId: number;
  tanggal: string;
  beratBadan: number | null;
  tinggiBadan: number | null;
  zScoreBBTB?: number | null;
  zScoreBBU?: number | null;
  zScoreTBU?: number | null;
  kategoriGizi?: string | null; // "Gizi Baik" etc
  statusStunting?: string | null; // "Pendek", "Sangat Pendek", "Normal"
  createdAt?: string;
}

export interface BalitaRow {
  id: number;
  nama: string;
  nik: string;
  noKK?: string | null;
  jenisKelamin?: string | null; // "Laki-laki" / "Perempuan"
  tanggalLahir?: string | null;
  // umurBulan?: number | null;
  alamat?: string | null;
  statusGiziTerakhir?: StatusGizi | null;
  riwayatStatusGizi?: StatusGizi[] | null;
  pemeriksaanTerakhir?: Pemeriksaan | null;
  riwayatPemeriksaan?: Pemeriksaan[] | null;
}

interface PemantauanResponse {
  status: string;
  posyandu?: string;
  wilayah?: string;
  kelurahan?: string;
  totalBalita?: number;
  risikoGiziLebih?: number;
  giziBaik?: number;
  giziKurang?: number;
  giziBuruk?: number;
  stunting?: number;
  rataRataZScore?: { bbu?: number; tbu?: number; bbtb?: number } | null;
  data: BalitaRow[];
}

/* ============================================================
   HELPERS
============================================================ */

function formatTanggal(dateStr?: string | null) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function safeNum(n?: number | null) {
  return typeof n === "number" && !Number.isNaN(n) ? n : 0;
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function PemantauanGiziBalitaPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<BalitaRow[]>([]);

  const [posyandu, setPosyandu] = useState("");
  const [wilayah, setWilayah] = useState("");
  const [kelurahan, setKelurahan] = useState("");

  // aggregated (some APIs already return these fields; otherwise compute)
  const [agg, setAgg] = useState<{
    totalBalita: number;
    risikoGiziLebih: number;
    giziBaik: number;
    giziKurang: number;
    giziBuruk: number;
    stunting: number;
    rataRataZScore: { bbu: number; tbu: number; bbtb: number };
  } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<BalitaRow | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/kader/statusGiziBalita");
        if (!res.ok) throw new Error("Gagal memuat data");
        const json: PemantauanResponse = await res.json();

        // safe assign meta
        setPosyandu(json.posyandu ?? "");
        setWilayah(json.wilayah ?? "");
        setKelurahan(json.kelurahan ?? "");

        // if API returns aggregates, use them; otherwise compute
        if (
          typeof json.totalBalita === "number" &&
          typeof json.giziBaik === "number"
        ) {
          setAgg({
            totalBalita: json.totalBalita ?? json.data.length,
            risikoGiziLebih: json.risikoGiziLebih ?? 0,
            giziBaik: json.giziBaik ?? 0,
            giziKurang: json.giziKurang ?? 0,
            giziBuruk: json.giziBuruk ?? 0,
            stunting: json.stunting ?? 0,
            rataRataZScore: {
              bbu: json.rataRataZScore?.bbu ?? 0,
              tbu: json.rataRataZScore?.tbu ?? 0,
              bbtb: json.rataRataZScore?.bbtb ?? 0,
            },
          });
        } else {
          // compute from data
          const list = json.data ?? [];
          const totals = {
            totalBalita: list.length,
            risikoGiziLebih: 0,
            giziBaik: 0,
            giziKurang: 0,
            giziBuruk: 0,
            stunting: 0,
            sumBBU: 0,
            sumTBU: 0,
            sumBBTB: 0,
            countBBU: 0,
            countTBU: 0,
            countBBTB: 0,
          };

          for (const b of list) {
            const s = b.statusGiziTerakhir;
            if (s?.kategoriGizi === "Risiko Gizi Lebih") totals.risikoGiziLebih++;
            if (s?.kategoriGizi === "Gizi Baik") totals.giziBaik++;
            if (s?.kategoriGizi === "Gizi Kurang") totals.giziKurang++;
            if (s?.kategoriGizi === "Gizi Buruk") totals.giziBuruk++;
            if (s?.statusStunting === "Pendek" || s?.statusStunting === "Sangat Pendek")
              totals.stunting++;

            if (typeof s?.zScoreBBU === "number") { totals.sumBBU += s.zScoreBBU; totals.countBBU++; }
            if (typeof s?.zScoreTBU === "number") { totals.sumTBU += s.zScoreTBU; totals.countTBU++; }
            if (typeof s?.zScoreBBTB === "number") { totals.sumBBTB += s.zScoreBBTB; totals.countBBTB++; }
          }

          setAgg({
            totalBalita: totals.totalBalita,
            risikoGiziLebih: totals.risikoGiziLebih,
            giziBaik: totals.giziBaik,
            giziKurang: totals.giziKurang,
            giziBuruk: totals.giziBuruk,
            stunting: totals.stunting,
            rataRataZScore: {
              bbu: totals.countBBU ? totals.sumBBU / totals.countBBU : 0,
              tbu: totals.countTBU ? totals.sumTBU / totals.countTBU : 0,
              bbtb: totals.countBBTB ? totals.sumBBTB / totals.countBBTB : 0,
            },
          });
        }

        setData(json.data ?? []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Terjadi kesalahan mengambil data");
        setLoading(false);
      }
    }

    load();
  }, []);

  // filtered & pagination
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return data;
    return data.filter((b) => {
      return (
        b.nama.toLowerCase().includes(s) ||
        (b.nik ?? "").toLowerCase().includes(s) ||
        (b.noKK ?? "").toLowerCase().includes(s)
      );
    });
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  useEffect(() => setCurrentPage(1), [search, filtered.length]);

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // chart data
  const pieData = useMemo(() => {
    if (!agg) return [];
    return [
      { name: "Risiko Gizi Lebih", value: agg.risikoGiziLebih },
      { name: "Gizi Baik", value: agg.giziBaik },
      { name: "Gizi Kurang", value: agg.giziKurang },
      { name: "Gizi Buruk", value: agg.giziBuruk },
    ];
  }, [agg]);

  const barData = useMemo(() => {
    if (!agg) return [];
    return [
      { name: "BB/U", value: Number((agg.rataRataZScore.bbu ?? 0).toFixed(3)) },
      { name: "TB/U", value: Number((agg.rataRataZScore.tbu ?? 0).toFixed(3)) },
      { name: "BB/TB", value: Number((agg.rataRataZScore.bbtb ?? 0).toFixed(3)) },
    ];
  }, [agg]);

  const COLORS = ["#FF9F43", "#10B981", "#F59E0B", "#EF4444"]; // orange, green, amber, red

  const openDetail = (b: BalitaRow) => {
    setSelected(b);
    setShowDetail(true);
  };
  const closeDetail = () => {
    setSelected(null);
    setShowDetail(false);
  };

  if (loading) return <p className="text-center text-green-500 py-12">Memuat data status gizi...</p>;
  if (error) return <p className="text-center py-12 text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Pemantauan Status Gizi Balita</h2>
          <p className="text-sm text-gray-500">{posyandu ? `${posyandu} • ${wilayah} • ${kelurahan}` : "Posyandu"}</p>
        </div>
      </div>

      {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
            <PieGiziChart
            pieData={pieData}
            total={agg?.totalBalita ?? data.length}
            />
        </div>

        <div className="lg:col-span-2">
            <BarZScoreChart
            barData={barData}
            z={agg?.rataRataZScore ?? { bbu: 0, tbu: 0, bbtb: 0 }}
            />
        </div>
        </div>

      {/* LIST */}
        <div className="flex items-center gap-3">
          <div className="w-56">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama / NIK..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>
        </div>
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Daftar Balita</h3>
          <div className="text-sm text-gray-500">Menampilkan {filtered.length} hasil</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 text-left">No</th>
                <th className="p-3 text-left">Balita</th>
                <th className="p-3 text-left">Tanggal Lahir</th>
                <th className="p-3 text-left">Umur</th>
                <th className="p-3 text-left">Status Gizi</th>
                <th className="p-3 text-left">Status Stunting</th>
                <th className="p-3 text-left">Pemeriksaan Terakhir</th>
                <th className="p-3 text-left">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {paginated.filter((b) => b.pemeriksaanTerakhir?.tanggal).length === 0 && (
                <tr>
                  <td colSpan={8} className="p-5 italic text-center text-gray-500">
                    Belum ada data status gizi balita
                  </td>
                </tr>
              )}

              {paginated
                .filter((b) => b.pemeriksaanTerakhir?.tanggal) // FILTER DATA
                .map((b, index) => {
                  const s = b.statusGiziTerakhir;
                  return (
                    <tr key={b.id} className="border-t">

                      {/* NOMOR */}
                      <td className="px-4 py-4 font-medium text-gray-700">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>

                      <td className="p-3">
                        <div className="font-medium">{b.nama}</div>
                        <div className="text-xs text-gray-500">{b.nik}</div>
                        <div className="text-xs text-gray-500">{b.alamat}</div>
                      </td>

                      <td className="p-3">
                        {b.tanggalLahir
                          ? new Date(b.tanggalLahir).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </td>

                      <td className="p-3">
                        {(() => {
                          if (!b.tanggalLahir) return "-";

                          const tgl = new Date(b.tanggalLahir);
                          const now = new Date();

                          let tahun = now.getFullYear() - tgl.getFullYear();
                          let bulan = now.getMonth() - tgl.getMonth();

                          if (bulan < 0) {
                            tahun--;
                            bulan += 12;
                          }

                          return `${tahun} tahun ${bulan} bulan`;
                        })()}
                      </td>

                      <td className="p-3">
                        <BadgeKategori kategori={s?.kategoriGizi ?? "Belum"} />
                        <div className="text-xs text-gray-500 mt-1">
                          Z BB/U: {typeof s?.zScoreBBU === "number" ? s.zScoreBBU.toFixed(2) : "-"}
                          {" • "}Z TB/U: {typeof s?.zScoreTBU === "number" ? s.zScoreTBU.toFixed(2) : "-"}
                          {" • "}Z BB/TB: {typeof s?.zScoreBBTB === "number" ? s.zScoreBBTB.toFixed(2) : "-"}
                        </div>
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            s?.statusStunting === "Sangat Pendek"
                              ? "bg-red-100 text-red-700"
                              : s?.statusStunting === "Pendek"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {s?.statusStunting ?? "-"}
                        </span>
                      </td>

                      <td className="p-3">
                        {b.pemeriksaanTerakhir?.tanggal
                          ? new Date(b.pemeriksaanTerakhir.tanggal).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </td>

                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openDetail(b)}
                            className="px-3 py-1 text-xs rounded-lg bg-sky-600 text-white"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        {filtered.length > itemsPerPage && (
          <div className="flex justify-between items-center p-4 text-sm">
            <p>Menampilkan {paginated.length} dari {filtered.length} data</p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="px-2 py-1 border rounded disabled:opacity-40"
              >
                {"<<"}
              </button>

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-2 py-1 border rounded disabled:opacity-40"
              >
                {"<"}
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === p ? "bg-emerald-600 text-white" : ""
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-2 py-1 border rounded disabled:opacity-40"
              >
                {">"}
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="px-2 py-1 border rounded disabled:opacity-40"
              >
                {">>"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {showDetail && selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-lg relative">
            <button onClick={closeDetail} className="absolute right-3 top-3 text-gray-500 hover:text-gray-700">✕</button>

            <div className="flex items-center gap-3 mb-4">
              <Info className="w-5 h-5 text-sky-600" />
              <h2 className="text-lg font-semibold">Detail Balita — {selected.nama}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p><b>NIK:</b> {selected.nik}</p>
                <p><b>No KK:</b> {selected.noKK ?? "-"}</p>
                <p><b>Tanggal Lahir:</b> {formatTanggal(selected.tanggalLahir)}</p>
                {/* <p><b>Umur (bulan):</b> {selected.umurBulan ?? "-"}</p> */}
                <p><b>Alamat:</b> {selected.alamat ?? "-"}</p>
              </div>

              <div>
                <h4 className="font-medium">Status Gizi Terakhir</h4>
                {!selected.statusGiziTerakhir ? (
                  <p className="text-gray-500">Belum ada data status gizi</p>
                ) : (
                  <div className="space-y-1">
                    <p><b>Tanggal:</b> {formatTanggal(selected.statusGiziTerakhir.tanggal)}</p>
                    <p><b>Berat (kg):</b> {selected.statusGiziTerakhir.beratBadan ?? "-"}</p>
                    <p><b>Tinggi (cm):</b> {selected.statusGiziTerakhir.tinggiBadan ?? "-"}</p>
                    <p><b>Z BB/U:</b> {typeof selected.statusGiziTerakhir.zScoreBBU === "number" ? selected.statusGiziTerakhir.zScoreBBU.toFixed(3) : "-"}</p>
                    <p><b>Z TB/U:</b> {typeof selected.statusGiziTerakhir.zScoreTBU === "number" ? selected.statusGiziTerakhir.zScoreTBU.toFixed(3) : "-"}</p>
                    <p><b>Z BB/TB:</b> {typeof selected.statusGiziTerakhir.zScoreBBTB === "number" ? selected.statusGiziTerakhir.zScoreBBTB.toFixed(3) : "-"}</p>
                    <p><b>Kategori:</b> {selected.statusGiziTerakhir.kategoriGizi ?? "-"}</p>
                    <p><b>Status Stunting:</b> {selected.statusGiziTerakhir.statusStunting ?? "-"}</p>
                  </div>
                )}
              </div>
            </div>

            <hr className="my-4" />

            <h4 className="font-medium mb-2">Riwayat Pemeriksaan (terakhir)</h4>
            <div className="max-h-48 overflow-y-auto text-sm">
              {(selected.riwayatPemeriksaan && selected.riwayatPemeriksaan.length) ? (
                selected.riwayatPemeriksaan.slice().reverse().map((r) => (
                  <div key={r.id} className="p-2 border-b last:border-b-0">
                    <div className="flex justify-between">
                      <div>
                        <div><b>{formatTanggal(r.tanggal)}</b> ({r.kegiatanId ? `keg:${r.kegiatanId}` : "kegiatan -"})</div>
                        <div className="text-xs text-gray-500">{r.keluhan ?? "-"}</div>
                      </div>
                      <div className="text-right text-sm">
                        <div>{r.beratBadan ?? "-"} kg</div>
                        <div className="text-xs text-gray-500">{r.tinggiBadan ?? "-"} cm</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">Belum ada riwayat pemeriksaan</div>
              )}
            </div>

            <div className="mt-5 text-right">
              <button onClick={closeDetail} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SMALL UI HELPERS
============================================================ */

const BadgeKategori = ({ kategori }: { kategori: string }) => {
  const k = kategori ?? "Belum";
  const map: Record<string, { bg: string; text: string }> = {
    "Risiko Gizi Lebih": { bg: "bg-amber-100", text: "text-amber-800" },
    "Gizi Baik": { bg: "bg-emerald-100", text: "text-emerald-800" },
    "Gizi Kurang": { bg: "bg-orange-100", text: "text-orange-800" },
    "Gizi Buruk": { bg: "bg-red-100", text: "text-red-800" },
    "Belum": { bg: "bg-gray-100", text: "text-gray-700" },
  };

  const style = map[k] ?? map["Belum"];
  return <span className={`px-2 py-1 rounded-lg text-xs font-medium ${style.bg} ${style.text}`}>{kategori}</span>;
};
