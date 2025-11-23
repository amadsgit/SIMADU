"use client";

import { useEffect, useState } from "react";

export default function CatatanIbuHamilPage() {
  const [ibuList, setIbuList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/ibuhamil`);
        const json = await res.json();

        if (!json.success) {
          setError("Gagal memuat data.");
          return;
        }

        setIbuList(json.data);
      } catch (err) {
        setError("Terjadi kesalahan server.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

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
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  // Fungsi hitung usia kehamilan otomatis
  const hitungUsiaKehamilan = (tanggalHPHT: string) => {
    const hpht = new Date(tanggalHPHT);
    const now = new Date();
    const selisih = now.getTime() - hpht.getTime();
    return Math.floor(selisih / (1000 * 60 * 60 * 24 * 7)); // minggu
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Catatan Ibu Hamil</h2>
      <p className="text-gray-500 mb-6">Riwayat pemeriksaan ibu hamil.</p>

      {ibuList.map((ibu: any) => (
        <div key={ibu.id} className="bg-white p-6 rounded-xl shadow space-y-6">
          
          {/* =========================
              HEADER DATA IBU HAMIL
          ========================== */}
          <div>
            <h2 className="text-xl font-bold text-gray-800">{ibu.nama}</h2>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div><strong>NIK:</strong> {ibu.nik}</div>
              <div><strong>Tgl Lahir:</strong> {new Date(ibu.tanggalLahir).toLocaleDateString()}</div>
              <div><strong>Golongan Darah:</strong> {ibu.golonganDarah}</div>
              <div><strong>Nama Suami:</strong> {ibu.namaSuami}</div>
              <div><strong>Alamat:</strong> {ibu.alamat}</div>
              <div><strong>Posyandu:</strong> {ibu.posyandu?.nama}</div>
              <div>
                <strong>Usia Kehamilan:</strong>{" "}
                {ibu.tanggalHPHT ? `${hitungUsiaKehamilan(ibu.tanggalHPHT)} minggu` : "-"}
              </div>
            </div>
          </div>

          {/* =========================
              RIWAYAT PEMERIKSAAN KEHAMILAN
          ========================== */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Riwayat Pemeriksaan Kehamilan
            </h3>

            {ibu.pemeriksaanKehamilan.length === 0 ? (
              <div className="text-gray-500">Belum ada catatan pemeriksaan.</div>
            ) : (
              <div className="space-y-4">
                {ibu.pemeriksaanKehamilan.map((periksa: any, index: number) => (
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
                      <div><strong>Usia Kehamilan:</strong> {periksa.usiaKehamilan} minggu</div>
                      <div><strong>BB:</strong> {periksa.beratBadan} kg</div>
                      <div><strong>Tensi:</strong> {periksa.tekananDarah}</div>
                      <div><strong>Tinggi Fundus:</strong> {periksa.tinggiFundus} cm</div>
                      <div><strong>DJJ:</strong> {periksa.detakJantungJanin} bpm</div>
                      <div><strong>Fe:</strong> {periksa.pemberianFe ? "Ya" : "Tidak"}</div>
                      <div><strong>PMT:</strong> {periksa.pmt ? periksa.jenisPmt : "Tidak"}</div>
                    </div>

                    {/* KELUHAN */}
                    <div className="mt-3">
                      <strong>Keluhan:</strong>
                      <div className="mt-1 p-2 bg-white rounded border">
                        {periksa.keluhan || <span className="text-gray-400">Tidak ada</span>}
                      </div>
                    </div>

                    {/* TINDAKAN */}
                    <div className="mt-3">
                      <strong>Tindakan:</strong>
                      <div className="mt-1 p-2 bg-white rounded border">
                        {periksa.tindakan || <span className="text-gray-400">Tidak ada</span>}
                      </div>
                    </div>

                    {/* CATATAN */}
                    <div className="mt-3">
                      <strong>Catatan:</strong>
                      <div className="mt-1 p-2 bg-white rounded border">
                        {periksa.catatan || <span className="text-gray-400">Tidak ada catatan</span>}
                      </div>
                    </div>

                    {/* KONSELING */}
                    <div className="mt-3">
                      <strong>Konseling:</strong>
                      <div className="mt-1 p-2 bg-white rounded border">
                        {periksa.konseling || <span className="text-gray-400">Tidak ada</span>}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}
