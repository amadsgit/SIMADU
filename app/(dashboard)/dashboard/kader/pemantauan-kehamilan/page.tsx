"use client";

import { useState, useEffect } from "react";
import { Search, CalendarDays, Users, Info } from "lucide-react";


export interface PemeriksaanTerakhir {
  id: number;
  ibuHamilId: number;
  kegiatanId: number;
  tanggal: string;
  usiaKehamilan: number;
  beratBadan: number | null;
  tekananDarah: string | null;
  tinggiFundus: number | null;
  detakJantungJanin: number | null;
  pemberianFe: boolean;
  pmt: boolean;
  jenisPmt: string | null;
  keluhan: string | null;
  tindakan: string | null;
  konseling: string | null;
  kaderId: number;
  pelaksanaanKegiatanId: number;
  createdAt: string;
  updatedAt: string;
}

export interface IbuHamil {
  id: number;
  nama: string;
  nik: string;
  noKK: string;
  tanggalHPHT: string | null;
  tanggalHPL: string | null;
  gravida: string | null;
  para: string | null;
  abortus: string | null;
  alamat: string | null;
  pemeriksaanTerakhir: PemeriksaanTerakhir | null;
}

export interface PemantauanKehamilanResponse {
  status: string;
  posyandu: string;
  wilayah: string;
  kelurahan: string;
  totalIbuHamil: number;
  hplBulanIni: number;
  trimester3: number;
  data: IbuHamil[];
}

/* ============================================================
   HELPER FUNCTIONS
============================================================ */

function hitungUmurKehamilan(hpht: string | null) {
  if (!hpht) return 0;
  const start = new Date(hpht);
  const now = new Date();
  const ms = now.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24 * 7));
}

function formatTanggal(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getMonitoringStatus(hpht: string | null, hpl: string | null) {
  if (!hpht || !hpl) return "normal";

  const umur = hitungUmurKehamilan(hpht);
  const dateHPL = new Date(hpl);
  const now = new Date();

  const selisihHari = Math.floor(
    (dateHPL.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (umur >= 36 || selisihHari <= 14) return "extra";
  if (umur >= 28 || selisihHari <= 30) return "prioritas";
  return "normal";
}


export default function PemantauanKehamilanPage() {
  /* ---------------- STATE MANAGEMENT ---------------- */
  const [search, setSearch] = useState("");
  const [data, setData] = useState<IbuHamil[]>([]);

  const [posyandu, setPosyandu] = useState("");
  const [wilayah, setWilayah] = useState("");

  const [total, setTotal] = useState(0);
  const [hplBulanIni, setHplBulanIni] = useState(0);
  const [trimester3, setTrimester3] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  /* ---------------- MODAL DETAIL ---------------- */
  const [showDetail, setShowDetail] = useState(false);
  const [selectedIbu, setSelectedIbu] = useState<IbuHamil | null>(null);

  const openDetail = (ibu: IbuHamil) => {
    setSelectedIbu(ibu);
    setShowDetail(true);
  };

  const closeDetail = () => {
    setSelectedIbu(null);
    setShowDetail(false);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/kader/pemantauanKehamilan");
        const json: PemantauanKehamilanResponse = await res.json();

        if (!res.ok) throw new Error("Gagal memuat data");

        setPosyandu(json.posyandu);
        setWilayah(json.wilayah);
        setTotal(json.totalIbuHamil);
        setHplBulanIni(json.hplBulanIni);
        setTrimester3(json.trimester3);
        setData(json.data);
        setLoading(false);
      } catch {
        setError("Terjadi kesalahan mengambil data");
        setLoading(false);
      }
    }

    loadData();
  }, []);


  //  FILTER DATA

  const filtered = data.filter((item) => {
    const s = search.toLowerCase();
    return (
      item.nama.toLowerCase().includes(s) ||
      item.nik.toLowerCase().includes(s)
    );
  });

  //  PAGINATION
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [filtered.length, totalPages]);

  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  if (loading) return <div className="flex justify-center items-center py-16 text-pink-600">
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
  if (error) return <p className="text-center py-10 text-red-600">{error}</p>;

  // modal
  const renderModalDetail = () => {
    if (!showDetail || !selectedIbu) return null;

    const p = selectedIbu.pemeriksaanTerakhir;

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-xl p-6 rounded-xl shadow-lg relative flex flex-col max-h-[90vh]">
          <button
            onClick={closeDetail}
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
          <div className="flex items-center gap-3 mb-4">
              <Info className="w-5 h-5 text-sky-600" />
              <h2 className="text-lg font-semibold">Detail Ibu Hamil — {selectedIbu.nama}</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 text-sm text-gray-700">
            <div className="space-y-2">
              <p><b>Nama:</b> {selectedIbu.nama}</p>
              <p><b>NIK:</b> {selectedIbu.nik}</p>
              <p><b>No KK:</b> {selectedIbu.noKK}</p>
              <p><b>HPHT:</b> {formatTanggal(selectedIbu.tanggalHPHT)}</p>
              <p><b>HPL:</b> {formatTanggal(selectedIbu.tanggalHPL)}</p>
              <p><b>Gravida:</b> {selectedIbu.gravida ?? "-"}</p>
              <p><b>Para:</b> {selectedIbu.para ?? "-"}</p>
              <p><b>Abortus:</b> {selectedIbu.abortus ?? "-"}</p>
              <p><b>Alamat:</b> {selectedIbu.alamat ?? "-"}</p>
            </div>
            <hr className="my-3" />
            <h3 className="font-semibold">Pemeriksaan Terakhir</h3>
            {!p ? (
              <p className="text-gray-500">Belum ada riwayat pemeriksaan</p>
            ) : (
              <div className="space-y-1">
                <p><b>Tanggal:</b> {formatTanggal(p.tanggal)}</p>
                <p><b>Usia Kehamilan:</b> {p.usiaKehamilan} minggu</p>
                <p><b>Berat Badan:</b> {p.beratBadan ?? "-"} kg</p>
                <p><b>Tekanan Darah:</b> {p.tekananDarah ?? "-"}</p>
                <p><b>Tinggi Fundus:</b> {p.tinggiFundus ?? "-"}</p>
                <p><b>DJJ:</b> {p.detakJantungJanin ?? "-"}</p>
                <p><b>PMT:</b> {p.jenisPmt ?? "-"}</p>
                <p><b>Keluhan:</b> {p.keluhan ?? "-"}</p>
                <p><b>Tindakan:</b> {p.tindakan ?? "-"}</p>
              </div>
            )}
          </div>

          <div className="mt-4 text-right">
            <button
              onClick={closeDetail}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="space-y-6">
      {renderModalDetail()}

      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Pemantauan Ibu Hamil – {posyandu} ({wilayah})
        </h2>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card icon={<Users className="w-10 h-10 text-emerald-600" />} label="Total Ibu Hamil" value={total} />
        <Card icon={<CalendarDays className="w-10 h-10 text-blue-600" />} label="Pemeriksaan Bulan Ini" value={total} />
        <Card icon={<CalendarDays className="w-10 h-10 text-orange-600" />} label="Trimester 3" value={trimester3} />
        <Card icon={<CalendarDays className="w-10 h-10 text-purple-600" />} label="HPL Bulan Ini" value={hplBulanIni} />
      </div>

      {/* SEARCH */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama / NIK..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white shadow-sm border rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <Th>No</Th>
              <Th>Ibu Hamil</Th>
              <Th>Usia Kehamilan</Th>
              <Th>HPL</Th>
              <Th>Pemeriksaan Terakhir</Th>
              <Th>Monitoring</Th>
              <Th>Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const filtered = paginatedData.filter(
                (item) => item.pemeriksaanTerakhir?.tanggal
              );

              if (filtered.length === 0) {
                return (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-5 text-center text-gray-500 italic"
                    >
                      Belum ada data ibu hamil diperiksa
                    </td>
                  </tr>
                );
              }

              return filtered.map((item, index) => {
                const status = getMonitoringStatus(
                  item.tanggalHPHT,
                  item.tanggalHPL
                );

                return (
                  <tr key={item.id} className="border-t">
                    {/* NOMOR */}
                    <td className="font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td>
                      <div className="font-medium">{item.nama}</div>
                      <div className="text-xs text-gray-500">{item.nik}</div>
                    </td>
                    <td>
                      {item.tanggalHPHT
                        ? `${hitungUmurKehamilan(item.tanggalHPHT)} minggu`
                        : "-"}
                    </td>
                    <td>{formatTanggal(item.tanggalHPL)}</td>
                    <td>
                      {item.pemeriksaanTerakhir
                        ? formatTanggal(item.pemeriksaanTerakhir.tanggal)
                        : "Belum pernah"}
                    </td>
                    <td>
                      {status === "extra" && <Badge color="red">EXTRA</Badge>}
                      {status === "prioritas" && (
                        <Badge color="orange">PRIORITAS</Badge>
                      )}
                      {status === "normal" && (
                        <Badge color="emerald">NORMAL</Badge>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button onClick={() => openDetail(item)} color="blue">
                          Lihat Detail
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>

        {/* PAGINATION */}
        {filtered.length > itemsPerPage && (
          <Pagination
            current={currentPage}
            total={totalPages}
            onChange={setCurrentPage}
            showing={paginatedData.length}
            totalData={filtered.length}
          />
        )}
      </div>
    </div>
  );
}

/* ============================================================
   REUSABLE UI COMPONENTS
============================================================ */

const Card = ({ icon, label, value }: any) => (
  <div className="p-4 rounded-xl bg-white border shadow-sm flex items-center gap-4">
    {icon}
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

const Th = ({ children }: any) => (
  <th className="p-3 text-left font-medium">{children}</th>
);

const Td = ({ children }: any) => <td className="p-3">{children}</td>;

const Button = ({ children, onClick, color }: any) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 text-xs rounded-lg text-white bg-${color}-600`}
  >
    {children}
  </button>
);

const Badge = ({ children, color }: any) => (
  <span
    className={`px-2 py-1 rounded-lg text-xs font-medium bg-${color}-100 text-${color}-700`}
  >
    {children}
  </span>
);

const Pagination = ({ current, total, onChange, showing, totalData }: any) => (
  <div className="flex justify-between items-center p-4 text-sm">
    <p>Menampilkan {showing} dari {totalData} data</p>
    <div className="flex gap-2">
      <button
        disabled={current === 1}
        onClick={() => onChange(1)}
        className="px-2 py-1 border rounded disabled:opacity-40"
      >
        {"<<"}
      </button>

      <button
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        className="px-2 py-1 border rounded disabled:opacity-40"
      >
        {"<"}
      </button>

      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1 border rounded ${
            current === p ? "bg-emerald-600 text-white" : ""
          }`}
        >
          {p}
        </button>
      ))}

      <button
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        className="px-2 py-1 border rounded disabled:opacity-40"
      >
        {">"}
      </button>

      <button
        disabled={current === total}
        onClick={() => onChange(total)}
        className="px-2 py-1 border rounded disabled:opacity-40"
      >
        {">>"}
      </button>
    </div>
  </div>
);
