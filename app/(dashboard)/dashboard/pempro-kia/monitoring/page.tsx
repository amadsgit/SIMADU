"use client";

import { useEffect, useState } from "react";
import TabsPane from '@/components/tab-pane-pemproKia';

type StatusPelaksanaan = "belum_mulai" | "berjalan" | "selesai";

interface Kegiatan {
  id: number;
  nama: string;
  deskripsi?: string;
  tanggalPelaksanaan?: string;
  posyandu: { id: number; nama: string; wilayah: string;
    kelurahan: any;
  };
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
  lingkarKepala: number,
  imunisasi: string,
  vitamin: string,
  jenisVitamin: string,
  pmt: string,
  jenisPmt: string,
  keluhan: string,
  tindakan: string,
  catatan: string,
  balita: { 
    id: number; 
    nama: string, 
    nik:string; 
    tanggalLahir:string; 
    alamat:string; 
  };
  statusGizi: StatusGizi[];
}

interface PemeriksaanIbuHamil {
  id: number;
  tanggal: string;
  usiaKehamilan: number;
  beratBadan?: number;
  tekananDarah: number;
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
  tanggalSelesai?: string;
  status: StatusPelaksanaan;
  posyandu: {
      id: number; 
      nama: string; 
      wilayah: string; 
      kelurahan: any;
  };
  kader: { id: number; nama: string };
  jumlahBalita: number;
  jumlahIbuHamil: number;
  catatanUmum?: string;
  pemeriksaanBalita: PemeriksaanBalita[];
  pemeriksaanIbuHamil: PemeriksaanIbuHamil[];
}


export default function MonitoringKIAPage() {
  const [data, setData] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  useEffect(() => {
    fetch("/api/pemproKia/monitoring")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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

  const filteredData = data.filter((k) =>
    k.nama.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <h2 className="text-2xl mb-2 font-bold text-gray-800">Monitoring & Laporan Kegiatan KIA</h2>

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
        <div className="text-gray-500">Tidak ada kegiatan KIA</div>
      )}

      {paginatedData.map((kegiatan) => {
        const showBalita = kegiatan.nama.toLowerCase().includes("balita");
        const showIbuHamil = kegiatan.nama.toLowerCase().includes("ibu hamil") ||
                             kegiatan.nama.toLowerCase().includes("anc");

        return (
          <div key={kegiatan.id} className="bg-white rounded-lg shadow-md border p-4 space-y-4">
            {/* HEADER */}
            <div>
              <h2 className="font-semibold text-lg">{kegiatan.nama}</h2>
              <p className="text-sm text-gray-500">{kegiatan.deskripsi}</p>
              <p className="text-xs text-gray-400">
                Tanggal: {new Date(kegiatan.tanggalPelaksanaan ?? "").toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-xs text-gray-400">
                Posyandu: {kegiatan.posyandu.nama} {kegiatan.posyandu.wilayah} kel.{kegiatan.posyandu.kelurahan.nama} | Program: {kegiatan.programKesehatan.nama}
              </p>
              {/* {kegiatan.status === "selesai" && (
                <button
                  // onClick={() => downloadPDF(pel, kegiatan)}
                  className="mt-2 px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                >
                  Download PDF
                </button>
              )} */}
            </div>

            {/* BODY Pelaksanaan */}
            {kegiatan.pelaksanaan.slice(0, itemsPerPage).map((pel) => (
              <div key={pel.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">
                    Pelaksanaan oleh {pel.kader.nama} | {pel.posyandu.nama} {kegiatan.posyandu.wilayah} Kel.{kegiatan.posyandu.kelurahan.nama}
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

                <div className="flex flex-col md:flex-row gap-4">
                  {showBalita && (
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">
                        Balita Diperiksa ({pel.jumlahBalita})
                      </h4>
                      <div className="max-h-40 overflow-y-auto border rounded p-2">
                        {pel.pemeriksaanBalita.length === 0 ? (
                          <p className="text-gray-500 text-xs">Belum ada data</p>
                        ) : (
                          pel.pemeriksaanBalita.map((b) => (
                            <div key={b.id} className="mb-2 border-b border-gray-100 pb-1 text-xs">
                              <p className="font-medium">
                                {b.balita.nama || "-"} ({b.balita.nik || "-"}) <br />

                                {(() => {
                                  const tgl = b.balita.tanggalLahir ? new Date(b.balita.tanggalLahir) : null;
                                  if (!tgl) return "Tanggal Lahir : - | Umur : -";

                                  const tanggalIndo = tgl.toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  });

                                  const today = new Date();
                                  let tahun = today.getFullYear() - tgl.getFullYear();
                                  let bulan = today.getMonth() - tgl.getMonth();
                                  let hari = today.getDate() - tgl.getDate();

                                  if (hari < 0) {
                                    bulan--;
                                    hari += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
                                  }
                                  if (bulan < 0) {
                                    tahun--;
                                    bulan += 12;
                                  }

                                  const umurString =
                                    tahun > 0
                                      ? `${tahun} th ${bulan} bl ${hari} hr`
                                      : bulan > 0
                                      ? `${bulan} bl ${hari} hr`
                                      : `${hari} hr`;

                                  return (
                                    <>
                                      Tanggal Lahir : {tanggalIndo} | Umur : {umurString}
                                    </>
                                  );
                                })()}

                                <br />
                                alamat : {b.balita.alamat || "-"}
                              </p>

                              <p>
                                BB: {b.beratBadan || "-"} kg | 
                                TB: {b.tinggiBadan || "-"} cm | 
                                LK: {b.lingkarKepala || "-"} cm | 
                                vitamin: {b.jenisVitamin || "-"} | 
                                PMT: {b.jenisPmt || "-"} | 
                                keluhan: {b.keluhan || "-"} | 
                                tindakan: {b.tindakan || "-"} | 
                                catatan : {b.catatan || "-"}
                              </p>
                              
                              {b.statusGizi.map((s) => {
                                const tanggal = new Date(s.tanggal).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                });

                                return (
                                  <p key={s.id}>
                                    Status Gizi tanggal {tanggal}: 
                                    zScoreBBU : {s.zScoreBBU || "-"} 
                                    zScoreTBU : {s.zScoreTBU || "-"} 
                                    zScoreBBTB : {s.zScoreBBTB || "-"} 
                                    kategori : {s.kategoriGizi || "-"} |{" "}
                                    status: {
                                      s.statusStunting
                                        ? ["pendek", "sangat pendek"].includes(s.statusStunting.toLowerCase())
                                          ? "Stunting"
                                          : s.statusStunting.toLowerCase() === "normal"
                                          ? "Normal"
                                          : "-"
                                        : "-"
                                    }
                                  </p>
                                );
                              })}

                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {showIbuHamil && (
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">
                        Ibu Hamil Diperiksa ({pel.jumlahIbuHamil})
                      </h4>
                      <div className="max-h-40 overflow-y-auto border rounded p-2">
                        {pel.pemeriksaanIbuHamil.length === 0 ? (
                          <p className="text-gray-500 text-xs">Belum ada data</p>
                        ) : (
                          pel.pemeriksaanIbuHamil.map((i) => (
                            <div key={i.id} className="mb-2 border-b border-gray-100 pb-1 text-xs">
                              <p className="font-medium">
                                {i.ibuHamil.nama || "-"} ({i.ibuHamil.nik || "-"}) <br />

                                {(() => {
                                  const tgl = i.ibuHamil.tanggalLahir ? new Date(i.ibuHamil.tanggalLahir) : null;
                                  if (!tgl) return "Tanggal Lahir : - | Umur : -";

                                  const tanggalIndo = tgl.toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  });

                                  const today = new Date();
                                  let tahun = today.getFullYear() - tgl.getFullYear();
                                  let bulan = today.getMonth() - tgl.getMonth();

                                  if (bulan < 0) {
                                    tahun--;
                                    bulan += 12;
                                  }

                                  const umurString = `${tahun} tahun ${bulan} bulan`;

                                  return (
                                    <>
                                      Tanggal Lahir : {tanggalIndo} | Umur : {umurString}
                                    </>
                                  );
                                })()}

                                <br />
                                alamat : {i.ibuHamil.alamat || "-"}
                              </p>

                              <p>
                                Usia Kehamilan: {i.usiaKehamilan || "-"} minggu | 
                                Tanggal HPL: {i.ibuHamil.tanggalHPL
                                  ? new Date(i.ibuHamil.tanggalHPL).toLocaleDateString("id-ID", {
                                      day: "2-digit",
                                      month: "long",
                                      year: "numeric",
                                    })
                                  : "-"
                                } |
                                Berat: {i.beratBadan || "-"} kg |
                                Berat: {i.tekananDarah || "-"} |
                                Tinggi Fundus: {i.tinggiFundus || "-"} |
                                DJJ: {i.detakJantungJanin || "-"} |
                                pemberian Fe: {i.pemberianFe ? "ya" : "tidak"} |
                                pemberian PMT: {i.jenisPmt || "-"} |
                                keluhan: {i.keluhan || "-"} |
                                tindakan: {i.tindakan || "-"} |
                                konseling: {i.konseling || "-"} |
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {pel.catatanUmum && (
                  <p className="mt-2 text-gray-500 text-xs">
                    Catatan: {pel.catatanUmum}
                  </p>
                )}
              </div>
            ))}
          </div>
        );
      })}

      {/* PAGINATION BUTTONS */}
      {filteredData.length > itemsPerPage && (
        <div className="flex justify-between items-center p-4 text-sm">
          <p>Menampilkan {paginatedData.length} dari {filteredData.length} data</p>
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
