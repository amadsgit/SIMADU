"use client";

import { useEffect, useState } from "react";

export default function CatatanAnakPage() {
  const [balitaList, setBalitaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/ortubalita`);
        const json = await res.json();

        if (!json.success) {
          setError("Gagal memuat data.");
          return;
        }

        setBalitaList(json.data);
      } catch (err) {
        setError("Terjadi kesalahan server.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
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
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Catatan Anak</h2>
      <p className="text-gray-500 mb-6">Data catatan pemeriksaan balita.</p>

      {balitaList.map((balita: any) => (
        <div key={balita.id} className="bg-white p-6 rounded-xl shadow space-y-6">
          
          {/* =========================
              HEADER DATA ANAK
          ========================== */}
          <div>
            <h2 className="text-xl font-bold text-gray-800">{balita.nama}</h2>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div><strong>NIK:</strong> {balita.nik}</div>
              <div><strong>Tgl Lahir:</strong> {new Date(balita.tanggalLahir).toLocaleDateString()}</div>
              <div><strong>Jenis Kelamin:</strong> {balita.jenisKelamin}</div>
              <div><strong>Ayah:</strong> {balita.namaAyah}</div>
              <div><strong>Ibu:</strong> {balita.namaIbu}</div>
              <div>
                <strong>Posyandu:</strong> {balita.posyandu?.nama}
              </div>
            </div>
          </div>

          {/* =========================
              RIWAYAT PEMERIKSAAN
          ========================== */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Riwayat Pemeriksaan & Catatan
            </h3>

            {balita.pemeriksaanBalita.length === 0 ? (
              <div className="text-gray-500">Belum ada catatan pemeriksaan.</div>
            ) : (
              <div className="space-y-4">
                {balita.pemeriksaanBalita.map((periksa: any, index: number) => {
                  const gizi = balita.statusGizi?.find(
                    (s: any) => s.pemeriksaanBalitaId === periksa.id
                  );

                  return (
                    <div key={periksa.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-700">
                          Pemeriksaan {index + 1}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {new Date(periksa.tanggal).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mt-3">
                        <div><strong>BB:</strong> {periksa.beratBadan} kg</div>
                        <div><strong>TB:</strong> {periksa.tinggiBadan} cm</div>
                        <div><strong>Lingkar Kepala:</strong> {periksa.lingkarKepala} cm</div>
                        <div><strong>Imunisasi:</strong> {periksa.imunisasi || "-"}</div>
                        <div><strong>Vitamin:</strong> {periksa.vitamin ? periksa.jenisVitamin : "Tidak"}</div>
                        <div><strong>PMT:</strong> {periksa.pmt ? periksa.jenisPmt : "Tidak"}</div>
                      </div>

                      {/* CATATAN */}
                      <div className="mt-3">
                        <strong>Catatan:</strong>
                        <div className="mt-1 p-2 bg-white rounded border">
                          {periksa.catatan ? periksa.catatan : (
                            <span className="text-gray-400">Tidak ada catatan</span>
                          )}
                        </div>
                      </div>

                      {/* STATUS GIZI */}
                      {gizi && (
                        <div className="mt-3">
                          <strong>Status Gizi:</strong>
                          <div className="mt-1 p-2 bg-white rounded border text-sm">
                            <div><strong>Kategori:</strong> {gizi.kategoriGizi}</div>
                            <div><strong>Stunting:</strong> {gizi.statusStunting}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}
