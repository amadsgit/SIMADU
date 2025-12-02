'use client';

import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { useState, useEffect } from 'react';

interface IbuHamil {
  id: number;
  nama: string;
  nik: string;
}

interface FormIbuHamilProps {
  kegiatanId: number;
  pelaksanaanKegiatanId: number | null;
  daftarIbuHamil: IbuHamil[];
}

export default function FormIbuHamil({
  kegiatanId,
  pelaksanaanKegiatanId,
  daftarIbuHamil = [],
}: FormIbuHamilProps) {
  const [form, setForm] = useState({
    ibuHamilId: '',
    tanggal: new Date().toISOString().split('T')[0],
    usiaKehamilan: '',
    beratBadan: '',
    tekananDarah: '',
    tinggiFundus: '',
    detakJantungJanin: '',
    pemberianFe: false,
    pmt: false,
    jenisPmt: '',
    keluhan: '',
    tindakan: '',
    konseling: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' && e.target instanceof HTMLInputElement
          ? e.target.checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.ibuHamilId || !form.usiaKehamilan) {
      toast.error('Isi minimal: Nama Ibu Hamil dan Usia Kehamilan.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/kader/kegiatan/${kegiatanId}/pelaksanaan/pemeriksaan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ibuHamil',
          ibuHamilId: Number(form.ibuHamilId),
          tanggal: form.tanggal,
          usiaKehamilan: Number(form.usiaKehamilan),
          beratBadan: form.beratBadan ? parseFloat(form.beratBadan) : null,
          tekananDarah: form.tekananDarah || null,
          tinggiFundus: form.tinggiFundus ? parseFloat(form.tinggiFundus) : null,
          detakJantungJanin: form.detakJantungJanin ? parseInt(form.detakJantungJanin) : null,
          pemberianFe: form.pemberianFe,
          pmt: form.pmt,
          jenisPmt: form.jenisPmt || null,
          keluhan: form.keluhan || null,
          tindakan: form.tindakan || null,
          konseling: form.konseling || null,
          pelaksanaanKegiatanId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan data');

      toast.success('Pemeriksaan ibu hamil berhasil disimpan');

      setForm({
        ibuHamilId: '',
        tanggal: new Date().toISOString().split('T')[0],
        usiaKehamilan: '',
        beratBadan: '',
        tekananDarah: '',
        tinggiFundus: '',
        detakJantungJanin: '',
        pemberianFe: false,
        pmt: false,
        jenisPmt: '',
        keluhan: '',
        tindakan: '',
        konseling: '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  // FETCH otomatis usia kehamilan
  useEffect(() => {
    const fetchUsiaKehamilan = async () => {
      if (!form.ibuHamilId) return;

      try {
        const res = await fetch(`/api/kader/kegiatan/${kegiatanId}/pelaksanaan/pemeriksaan/hpht?ibuHamilId=${form.ibuHamilId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Gagal menghitung usia kehamilan');

        setForm((prev) => ({
          ...prev,
          usiaKehamilan: String(data.usiaKehamilan),
        }));
      } catch (err: any) {
        toast.error(err.message);
      }
    };

    fetchUsiaKehamilan();
  }, [form.ibuHamilId, kegiatanId]);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-emerald-100 rounded-lg p-4 shadow-sm mt-2"
    >
      <h3 className="font-semibold text-pink-500 mb-3 text-sm">
        Form Pemeriksaan Ibu Hamil
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {/* Nama Ibu Hamil */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Nama Ibu Hamil <span className="text-xs text-rose-500">*</span>
          </label>
          <select
            name="ibuHamilId"
            value={form.ibuHamilId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          >
            <option value="">-- Pilih Ibu Hamil --</option>
            {daftarIbuHamil.length > 0 ? (
              daftarIbuHamil.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nama} ({i.nik})
                </option>
              ))
            ) : (
              <option disabled>Data ibu hamil belum tersedia</option>
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

        {/* Usia Kehamilan */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Usia Kehamilan (minggu) <span className="text-xs text-rose-500">*</span>
          </label>
          <input
            type="number"
            name="usiaKehamilan"
            value={form.usiaKehamilan}
            disabled
            onChange={handleChange}
            placeholder="Terhitung Otomatis"
            className="w-full border bg-gray-100 border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
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
            step="0.1"
            name="beratBadan"
            value={form.beratBadan}
            onChange={handleChange}
            placeholder="Contoh: 45.2"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Tekanan Darah */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Tekanan Darah (mmHg) <span className="text-xs text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="tekananDarah"
            value={form.tekananDarah}
            onChange={handleChange}
            placeholder="Contoh: 120/80"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Tinggi Fundus */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Tinggi Fundus (cm) <span className="text-xs text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            name="tinggiFundus"
            value={form.tinggiFundus}
            onChange={handleChange}
            placeholder="contoh: 32"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Detak Jantung Janin */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Detak Jantung Janin (/menit) <span className="text-xs text-rose-500">*</span>
          </label>
          <input
            type="number"
            name="detakJantungJanin"
            value={form.detakJantungJanin}
            onChange={handleChange}
            placeholder="Contoh: 63"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Tablet Fe */}
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            id="pemberianFe"
            name="pemberianFe"
            checked={form.pemberianFe}
            onChange={handleChange}
            className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
          />
          <label htmlFor="pemberianFe" className="text-gray-700 font-medium">
            Diberi Tablet Fe
          </label>
        </div>

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

        {/* Konseling */}
        <div className="sm:col-span-2">
          <label className="block text-gray-700 font-medium mb-1">
            Konseling
          </label>
          <textarea
            name="konseling"
            value={form.konseling}
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
