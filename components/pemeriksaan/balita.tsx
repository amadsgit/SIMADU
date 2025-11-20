'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

interface RiwayatImunisasi {
  imunisasi: string;
  tanggal: string;
}

interface Balita {
  id: number;
  nama: string;
  nik: string;
  tanggalLahir: string;
  pemeriksaanBalita: RiwayatImunisasi[];
}

interface FormBalitaProps {
  kegiatanId: number;
  pelaksanaanKegiatanId: number | null;
  daftarBalita: Balita[];
  isProgramImunisasi?: boolean; // <--- tambahan
}

export default function FormBalita({
  kegiatanId,
  pelaksanaanKegiatanId,
  daftarBalita = [],
  isProgramImunisasi = false,
}: FormBalitaProps) {
  const [selectedBalita, setSelectedBalita] = useState<Balita | null>(null);

  const [form, setForm] = useState({
    balitaId: '',
    tanggal: new Date().toISOString().split('T')[0],
    beratBadan: '',
    tinggiBadan: '',
    lingkarKepala: '',
    imunisasi: '',
    vitamin: false,
    jenisVitamin: '',
    pmt: false,
    jenisPmt: '',
    keluhan: '',
    tindakan: '',
    catatan: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === 'balitaId') {
      const found = daftarBalita.find((b) => b.id === Number(value)) || null;
      setSelectedBalita(found);
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' && e.target instanceof HTMLInputElement
        ? e.target.checked
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.balitaId || !form.beratBadan || !form.tinggiBadan) {
      toast.error('Isi minimal: Nama Balita, Berat Badan, dan Tinggi Badan.');
      return;
    }

    if (isProgramImunisasi && !form.imunisasi) {
      toast.error('Jenis imunisasi wajib diisi untuk kegiatan imunisasi');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/kader/kegiatan/${kegiatanId}/pelaksanaan/pemeriksaan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'balita',
          balitaId: Number(form.balitaId),
          tanggal: form.tanggal,
          beratBadan: parseFloat(form.beratBadan),
          tinggiBadan: parseFloat(form.tinggiBadan),
          lingkarKepala: form.lingkarKepala ? parseFloat(form.lingkarKepala) : null,
          imunisasi: form.imunisasi || null,
          vitamin: form.vitamin,
          jenisVitamin: form.jenisVitamin || null,
          pmt: form.pmt,
          jenisPmt: form.jenisPmt || null,
          keluhan: form.keluhan || null,
          tindakan: form.tindakan || null,
          catatan: form.catatan || null,
          pelaksanaanKegiatanId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan data');

      toast.success('Pemeriksaan balita berhasil disimpan');

      setForm({
        balitaId: '',
        tanggal: new Date().toISOString().split('T')[0],
        beratBadan: '',
        tinggiBadan: '',
        lingkarKepala: '',
        imunisasi: '',
        vitamin: false,
        jenisVitamin: '',
        pmt: false,
        jenisPmt: '',
        keluhan: '',
        tindakan: '',
        catatan: '',
      });
      setSelectedBalita(null);
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-emerald-100 rounded-lg p-4 shadow-sm mt-2"
    >
      <h3 className="font-semibold text-emerald-500 mb-3 text-sm">
        Form Pemeriksaan Balita
      </h3>

      {selectedBalita && (
        <div className=" bg-green-50 border border-green-200 p-1 rounded-md">
          <h4 className="text-xs text-emerald-700">
            Riwayat Imunisasi: {selectedBalita.nama}
          </h4>

          {selectedBalita.pemeriksaanBalita.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada riwayat imunisasi.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {selectedBalita.pemeriksaanBalita.map((riw, i) => (
                <li key={i} className="flex justify-between border-b py-1">
                  <span className="text-gray-500">{riw.imunisasi}</span>
                  <span className="text-gray-500">{new Date(riw.tanggal).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {/* Nama Balita */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Nama Balita <span className="text-xs text-rose-500">*</span>
          </label>
          <select
            name="balitaId"
            value={form.balitaId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          >
            <option value="">-- Pilih Balita --</option>
            {daftarBalita.length > 0 ? (
              daftarBalita.map((b) => {
                const lahir = new Date(b.tanggalLahir);
                const now = new Date();

                const diff = now.getTime() - lahir.getTime();
                const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));

                const bulan = Math.floor(totalDays / 30);
                const minggu = Math.floor((totalDays % 30) / 7);

                const umur = `${bulan} bln${minggu > 0 ? ` ${minggu} mg` : ""}`;

                return (
                  <option key={b.id} value={b.id}>
                    ({b.nik}) {b.nama} - {umur}
                  </option>
                );
              })
            ) : (
              <option disabled>Data balita belum tersedia</option>
            )}
          </select>
        </div>

        {/* Tanggal Pemeriksaan */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Tanggal Pemeriksaan <span className="text-xs text-rose-500">*</span>
          </label>
          <input
            type="date"
            name="tanggal"
            value={form.tanggal}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        {/* Berat Badan */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Berat Badan (kg) <span className="text-xs text-rose-500">*</span>
          </label>
          <input
            type="number"
            name="beratBadan"
            step="0.01"
            value={form.beratBadan}
            onChange={handleChange}
            placeholder="contoh: 12.5"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        {/* Tinggi Badan */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Tinggi Badan (cm) <span className="text-xs text-rose-500">*</span>
          </label>
          <input
            type="number"
            name="tinggiBadan"
            step="0.1"
            value={form.tinggiBadan}
            onChange={handleChange}
            placeholder="contoh: 80.5"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        {/* Lingkar Kepala */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Lingkar Kepala (cm) <span className="text-xs text-rose-500">*</span>
          </label>
          <input
            type="number"
            name="lingkarKepala"
            step="0.1"
            value={form.lingkarKepala}
            onChange={handleChange}
            placeholder="Contoh: 31.2"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Imunisasi */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Jenis Imunisasi
          </label>
          <input
            type="text"
            name="imunisasi"
            value={form.imunisasi}
            onChange={handleChange}
            placeholder="Contoh: BCG, DPT, Campak"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Vitamin */}
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            id="vitamin"
            name="vitamin"
            checked={form.vitamin}
            onChange={handleChange}
            className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
          />
          <label htmlFor="vitamin" className="text-gray-700 font-medium">
            Diberi Vitamin
          </label>
        </div>
        {form.vitamin && (
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Jenis Vitamin
            </label>
            <input
              type="text"
              name="jenisVitamin"
              value={form.jenisVitamin}
              onChange={handleChange}
              placeholder="Contoh: Vitamin A"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        )}

        {/* PMT */}
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            id="pmt"
            name="pmt"
            checked={form.pmt}
            onChange={handleChange}
            className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
          />
          <label htmlFor="pmt" className="text-gray-700 font-medium">
            Diberi PMT
          </label>
        </div>
        {form.pmt && (
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Jenis PMT
            </label>
            <input
              type="text"
              name="jenisPmt"
              value={form.jenisPmt}
              onChange={handleChange}
              placeholder="Contoh: Biskuit, Bubur kacang hijau"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        )}

        {/* Keluhan */}
        <div className="sm:col-span-2">
          <label className="block text-gray-700 font-medium mb-1">
            Keluhan
          </label>
          <textarea
            name="keluhan"
            value={form.keluhan}
            onChange={handleChange}
            placeholder="Opsional"
            className="w-full border border-gray-300 rounded-md p-2 h-16 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Tindakan */}
        <div className="sm:col-span-2">
          <label className="block text-gray-700 font-medium mb-1">
            Tindakan
          </label>
          <textarea
            name="tindakan"
            value={form.tindakan}
            onChange={handleChange}
            placeholder="Opsional"
            className="w-full border border-gray-300 rounded-md p-2 h-16 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Catatan */}
        <div className="sm:col-span-2">
          <label className="block text-gray-700 font-medium mb-1">
            Catatan
          </label>
          <textarea
            name="catatan"
            value={form.catatan}
            onChange={handleChange}
            placeholder="Opsional"
            className="w-full border border-gray-300 rounded-md p-2 h-16 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>
      <p className="text-sm text-right text-orange-500">* Pastikan data yang anda input valid dan akurat sebelum submit</p>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:bg-green-400"
        >
          {loading ? (
            <>
              <Save className="w-4 h-4" /> Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Submit
            </>
          )}
        </button>
      </div>
    </form>
  );
}
