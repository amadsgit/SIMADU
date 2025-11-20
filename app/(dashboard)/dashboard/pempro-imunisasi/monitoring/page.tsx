"use client";

import { useEffect, useState } from "react";
import TabsPane from "@/components/tab-pane-pemproImunisasi";

type StatusPelaksanaan = "belum_mulai" | "berjalan" | "selesai";

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
  pmt: string;
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
  tanggalSelesai?: string;
  status: StatusPelaksanaan;
  posyandu: { id: number; nama: string };
  kader: { id: number; nama: string };
  jumlahBalita: number;
  catatanUmum?: string;
  pemeriksaanBalita: PemeriksaanBalita[];
}

interface Kegiatan {
  id: number;
  nama: string;
  deskripsi?: string;
  tanggalPelaksanaan?: string;
  alamat?: string;
  posyandu: {
    id: number;
    nama: string;
    alamat: string;
    wilayah: string;
    kelurahan: { id: number; nama: string };
  };
  programKesehatan: { id: number; nama: string };
  pelaksanaan: Pelaksanaan[];
}

export default function MonitoringImunisasiPage() {
  const [data, setData] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  // ========================================================
  // FETCH DATA BARU: /api/pemproImunisasi/monitoring
  // ========================================================
  useEffect(() => {
    fetch("/api/pemproImunisasi/monitoring")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return <div className="p-6 text-center text-green-500">Memuat data...</div>;

  // ========================================================
  // FILTERING
  // ========================================================
  const filteredData = data.filter((k) =>
    k.nama.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-2 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Monitoring & Laporan Kegiatan Imunisasi
      </h1>

      <TabsPane />

      {/* SEARCH */}
      <div className="max-w-sm">
        <input
          type="text"
          placeholder="Cari nama kegiatan..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* DATA */}
      {paginatedData.length === 0 && (
        <div className="text-gray-500">Tidak ada kegiatan imunisasi</div>
      )}

      {paginatedData.map((kegiatan) => (
        <div
          key={kegiatan.id}
          className="bg-white rounded-lg shadow-md border p-4 space-y-4"
        >
          {/* HEADER */}
          <div>
            <h2 className="font-semibold text-lg">{kegiatan.nama}</h2>
            <p className="text-sm text-gray-500">{kegiatan.deskripsi}</p>
            {kegiatan.tanggalPelaksanaan && (
              <p className="text-xs text-gray-400">
                Tanggal:{" "}
                {new Date(kegiatan.tanggalPelaksanaan).toLocaleDateString(
                  "id-ID",
                  {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>
            )}
            <p className="text-xs text-gray-400">
              Posyandu: {kegiatan.posyandu.nama} {kegiatan.posyandu.wilayah} –
              Kel.{kegiatan.posyandu.kelurahan.nama}
            </p>
          </div>

          {/* BODY PELAKSANAAN */}
          {kegiatan.pelaksanaan.slice(0, itemsPerPage).map((pel) => (
            <div
              key={pel.id}
              className="border border-gray-200 rounded-lg p-3 bg-white"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">
                  Pelaksanaan oleh {pel.kader.nama} | Posyandu{" "}
                  {pel.posyandu.nama}
                </span>

                <span
                  className={`px-2 py-1 text-xs rounded text-white ${
                    pel.status === "belum_mulai"
                      ? "bg-gray-400"
                      : pel.status === "berjalan"
                      ? "bg-blue-500"
                      : "bg-green-500"
                  }`}
                >
                  {pel.status.replace("_", " ")}
                </span>
              </div>

              {/* BALITA */}
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">
                  Balita Diperiksa ({pel.jumlahBalita})
                </h4>

                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  {pel.pemeriksaanBalita.length === 0 ? (
                    <p className="text-gray-500 text-xs">Belum ada data</p>
                  ) : (
                    pel.pemeriksaanBalita.map((b) => (
                      <div
                        key={b.id}
                        className="mb-2 border-b border-gray-100 pb-1 text-xs"
                      >
                        <p className="font-medium">
                          {b.balita.nama} ({b.balita.nik}) <br />
                          {(() => {
                            const lahir = new Date(b.balita.tanggalLahir);
                            const now = new Date();

                            const diff = now.getTime() - lahir.getTime();
                            const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));

                            const bulan = Math.floor(totalDays / 30);
                            const minggu = Math.floor((totalDays % 30) / 7);

                            const umur = `${bulan} bln${minggu > 0 ? ` ${minggu} mg` : ""}`;

                            return (
                              <>
                                Tgl Lahir:{" "}
                                {lahir.toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })}{" "}
                                | Umur: {umur}
                              </>
                            );
                          })()}

                          <br />
                          Alamat: {b.balita.alamat}
                        </p>

                        <p>
                          BB: {b.beratBadan} kg | TB: {b.tinggiBadan} cm | LK:{" "}
                          {b.lingkarKepala} cm | <span className="font-bold"> Imunisasi: {b.imunisasi} </span> | PMT:
                          {b.jenisPmt} | Keluhan: {b.keluhan} | Tindakan:{" "}
                          {b.tindakan}
                        </p>

                        {b.statusGizi.map((s) => (
                          <p key={s.id}>
                            Status Gizi {new Date(s.tanggal).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                            : BBU {s.zScoreBBU} | TBU {s.zScoreTBU} | BBTB{" "}
                            {s.zScoreBBTB} | Kategori {s.kategoriGizi} |{" "}
                            {["pendek", "sangat pendek"].includes(
                              (s.statusStunting || "").toLowerCase()
                            )
                              ? "Stunting"
                              : "Normal"}
                          </p>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {pel.catatanUmum && (
                <p className="mt-2 text-gray-500 text-xs">
                  Catatan: {pel.catatanUmum}
                </p>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* PAGINATION */}
      {filteredData.length > itemsPerPage && (
        <div className="flex justify-between items-center p-4 text-sm">
          <p>
            Menampilkan {paginatedData.length} dari {filteredData.length} data
          </p>
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
  );
}
