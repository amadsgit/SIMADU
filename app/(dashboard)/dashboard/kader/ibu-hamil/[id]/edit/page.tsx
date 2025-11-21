'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import ButtonBatal from '@/components/button-batal';
import ButtonUpdate from '@/components/button-update';
import dynamic from 'next/dynamic';

const ModalAmbilKoordinat = dynamic(
  () => import('@/components/modal-ambil-koordinat'),
  { ssr: false }
);

type SessionKader = {
  id: number;
  nama: string;
  posyandu: {
    id: number;
    nama: string;
    wilayah: string;
    alamat: string;
    kelurahan: { id: number; nama: string };
  };
};

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const nikRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    noKK: '',
    tanggalLahir: '',
    BBSH: '',
    TBSH: '',
    liLA: '',
    IMTSH: '',
    StatusGiziKEK: '',
    tanggalHPHT: '',
    umurKehamilanAwal: '',
    tanggalHPL: '',
    gravida: '',
    para: '',
    abortus: '',
    golonganDarah: 'Belum_diperiksa',
    kepemilikanJKN: 'Belum_punya',
    noJKN: '',
    kepemilikanBukuKIA: '',
    namaSuami: '',
    HPSuami: '',
    alamat: '',
    RT: '',
    RW: '',
    longitude: '',
    latitude: '',
  });

  const [sessionKader, setSessionKader] = useState<SessionKader | null>(null);
  const [loading, setLoading] = useState(false);
  const [nikError, setNikError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [showMap, setShowMap] = useState(false);

  // auto focus
  useEffect(() => {
    nikRef.current?.focus();
  }, []);

  // ambil data kader
  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch('/api/kader/balita/sessionKader');
        const data = await res.json();
        setSessionKader(data);
      } catch {
        toast.error("Gagal memuat data kader login");
      }
    };
    loadSession();
  }, []);

  // load data ibu hamil
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const res = await fetch(`/api/kader/ibuHamil/${id}`);
        const data = await res.json();

        setFormData({
          nama: data.nama || '',
          nik: data.nik || '',
          noKK: data.noKK || '',
          tanggalLahir: data.tanggalLahir?.split('T')[0] || '',
          BBSH: data.BBSH?.toString() || '',
          TBSH: data.TBSH?.toString() || '',
          liLA: data.liLA?.toString() || '',
          IMTSH: data.IMTSH?.toString() || '',
          StatusGiziKEK: data.StatusGiziKEK || '',
          tanggalHPHT: data.tanggalHPHT?.split('T')[0] || '',
          umurKehamilanAwal: data.umurKehamilanAwal?.toString() || '',
          tanggalHPL: data.tanggalHPL?.split('T')[0] || '',
          gravida: data.gravida?.toString() || '',
          para: data.para?.toString() || '',
          abortus: data.abortus?.toString() || '',
          golonganDarah: data.golonganDarah || 'Belum_diperiksa',
          kepemilikanJKN: data.kepemilikanJKN || 'Belum_punya',
          noJKN: data.noJKN || '',
          kepemilikanBukuKIA: data.kepemilikanBukuKIA || '',
          namaSuami: data.namaSuami || '',
          HPSuami: data.HPSuami || '',
          alamat: data.alamat || '',
          RT: data.RT || '',
          RW: data.RW || '',
          longitude: data.longitude?.toString() || '',
          latitude: data.latitude?.toString() || '',
        });

      } catch {
        toast.error("Gagal memuat data ibu hamil");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [id]);


  // ================================
  // HANDLE CHANGE
  // ================================
  const handleChange = async (e: any) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    // Validasi NIK realtime
    if (name === 'nik') {
      if (value.length < 16) return setNikError('NIK harus 16 digit');
      try {
        const res = await fetch(`/api/check-email-nik?nik=${encodeURIComponent(value)}`);
        const d = await res.json();
        setNikError(d.exists ? 'NIK sudah terdaftar' : null);
      } catch {
        setNikError("Gagal memeriksa NIK");
      }
    }

    // Kalkulasi otomatis HPL & Usia Kehamilan
    if (name === 'tanggalHPHT' && value) {
      const hpht = new Date(value);
      const hpl = new Date(hpht);

      hpl.setDate(hpht.getDate() + 7);
      hpl.setMonth(hpht.getMonth() + 9);

      const now = new Date();
      const weeks = Math.floor((now.getTime() - hpht.getTime()) / (1000 * 60 * 60 * 24 * 7));

      setFormData(prev => ({
        ...prev,
        tanggalHPL: hpl.toISOString().split("T")[0],
        umurKehamilanAwal: weeks > 0 ? String(weeks) : "0"
      }));
    }

    // Kalkulasi IMT & KEK
    if (['BBSH', 'TBSH', 'liLA'].includes(name)) {
      const bb = Number(name === 'BBSH' ? value : formData.BBSH);
      const tb = Number(name === 'TBSH' ? value : formData.TBSH);
      const lila = Number(name === 'liLA' ? value : formData.liLA);

      let imt = '';
      let kek = '';

      // IMT
      if (bb > 0 && tb > 0) {
        const tbM = tb / 100;
        imt = (bb / (tbM * tbM)).toFixed(2);
      }

      // KEK
      if (lila > 0) {
        kek = lila < 23.5 ? 'KEK' : 'Tidak KEK';
      }

      setFormData(prev => ({
        ...prev,
        IMTSH: imt,
        StatusGiziKEK: kek
      }));
    }
  };


  // ============================
  // SUBMIT
  // ============================
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const required = ['nama', 'nik', 'noKK', 'tanggalLahir', 'alamat'];
    if (required.some(f => !formData[f as keyof typeof formData]))
      return toast.error("Field wajib harus diisi!");

    if (nikError) return toast.error(nikError);

    setLoading(true);
    try {
      const res = await fetch(`/api/kader/ibuHamil/${id}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal update data");

      toast.success(data.message);
      router.push('/dashboard/kader/ibu-hamil');

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };


  if (loadingData) {
    return <div className="p-10 text-center text-green-600 animate-pulse">Memuat data ibu hamil...</div>;
  }


  return (
    <div>
      <div className="max-w-full mx-auto">
        <div className="p-6 border bg-white shadow-md rounded-xl">
          <h1 className="text-2xl font-bold mb-8">
            Edit <span className="text-pink-600">Ibu Hamil</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* NIK */}
              <div>
                <label className="block text-sm font-semibold mb-1">NIK <span className="text-xs text-red-500">*</span></label>
                <input
                  type="text"
                  name="nik"
                  ref={nikRef}
                  value={formData.nik}
                  onChange={handleChange}
                  maxLength={16}
                  placeholder="16 digit NIK"
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 outline-none transition ${
                    nikError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-emerald-400'
                  }`}
                />
                {nikError && <p className="text-xs text-red-500 mt-1">{nikError}</p>}
              </div>

              {/* Nama */}
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Ibu Hamil <span className="text-xs text-red-500">*</span></label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Nama lengkap ibu hamil"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* No KK */}
              <div>
                <label className="block text-sm font-semibold mb-1">No KK <span className="text-xs text-red-500">*</span></label>
                <input
                  type="text"
                  name="noKK"
                  maxLength={16}
                  value={formData.noKK}
                  onChange={handleChange}
                  placeholder="16 digit Nomor KK"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-sm font-semibold mb-1">Tanggal Lahir <span className="text-xs text-red-500">*</span></label>
                <input
                  type="date"
                  name="tanggalLahir"
                  value={formData.tanggalLahir}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* ✔ BARU – BBSH */}
              <div>
                <label className="block text-sm font-semibold mb-1">Berat Badan Sebelum Hamil (kg) <span className="text-xs text-red-500">*</span></label>
                <input
                  type="number"
                  name="BBSH"
                  value={formData.BBSH}
                  onChange={handleChange}
                  placeholder="contoh: 48"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* ✔ BARU – TBSH */}
              <div>
                <label className="block text-sm font-semibold mb-1">Tinggi Badan Sebelum Hamil (cm) <span className="text-xs text-red-500">*</span></label>
                <input
                  type="number"
                  name="TBSH"
                  value={formData.TBSH}
                  onChange={handleChange}
                  placeholder="contoh: 158"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* ✔ BARU – LiLA */}
              <div>
                <label className="block text-sm font-semibold mb-1">Lingkar Lengan Atas (cm) <span className="text-xs text-red-500">*</span></label>
                <input
                  type="number"
                  name="liLA"
                  value={formData.liLA}
                  onChange={handleChange}
                  placeholder="contoh: 24"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* IMT */}
              <div>
                <label className="block text-sm font-semibold mb-1">IMT Sebelum Hamil atau IMT Trimester 1 <span className="text-xs text-red-500">*</span></label>
                <input
                  type="number"
                  name="IMTSH"
                  value={formData.IMTSH}
                  readOnly
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* Status Gizi KEK */}
              <div>
                <label className="block text-sm font-semibold mb-1">Status Gizi (KEK) <span className="text-xs text-red-500">*</span></label>
                <input
                  name="StatusGiziKEK"
                  value={formData.StatusGiziKEK}
                  readOnly
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* HPHT */}
              <div>
                <label className="block text-sm font-semibold mb-1">Tanggal HPHT <span className="text-xs text-red-500">*</span></label>
                <input
                  type="date"
                  name="tanggalHPHT"
                  value={formData.tanggalHPHT}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* Umur Kehamilan */}
              <div>
                <label className="block text-sm font-semibold mb-1">Umur Kehamilan Awal (minggu) <span className="text-xs text-red-500">*</span></label>
                <input
                  type="number"
                  name="umurKehamilanAwal"
                  value={formData.umurKehamilanAwal}
                  readOnly
                  className="w-full px-4 py-2 border rounded-xl bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* HPL */}
              <div>
                <label className="block text-sm font-semibold mb-1">Tanggal HPL <span className="text-xs text-red-500">*</span></label>
                <input
                  type="date"
                  name="tanggalHPL"
                  value={formData.tanggalHPL}
                  readOnly
                  className="w-full px-4 py-2 border rounded-xl bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Gravida */}
              <div>
                <label className="block text-sm font-semibold mb-1">Gravida (Kehamilan ke)</label>
                <input
                  type="number"
                  name="gravida"
                  value={formData.gravida}
                  onChange={handleChange}
                  placeholder="Contoh: 2"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* Para */}
              <div>
                <label className="block text-sm font-semibold mb-1">Para (Jumlah Persalinan)</label>
                <input
                  type="number"
                  name="para"
                  value={formData.para}
                  onChange={handleChange}
                  placeholder="Contoh: 1"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* Abortus */}
              <div>
                <label className="block text-sm font-semibold mb-1">Abortus (Keguguran)</label>
                <input
                  type="number"
                  name="abortus"
                  value={formData.abortus}
                  onChange={handleChange}
                  placeholder="Contoh: 0"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* ✔ BARU – Golongan Darah */}
              <div>
                <label className="block text-sm font-semibold mb-1">Golongan Darah</label>
                <select
                  name="golonganDarah"
                  value={formData.golonganDarah}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                >
                  <option value="Belum_diperiksa">-- Pilih --</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>

              {/* ✔ BARU – Kepemilikan JKN */}
              <div>
                <label className="block text-sm font-semibold mb-1">Kepemilikan JKN</label>
                <select
                  name="kepemilikanJKN"
                  value={formData.kepemilikanJKN}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                >
                  <option value="Belum_punya">-- Pilih --</option>
                  <option value="JKN">JKN</option>
                  <option value="Jamkesda">Jamkesda</option>
                  <option value="Jampersal">Jampersal</option>
                </select>
              </div>

              {/* No JKN */}
              <div>
                <label className="block text-sm font-semibold mb-1">Nomor JKN</label>
                <input
                  type="text"
                  name="noJKN"
                  value={formData.noJKN}
                  onChange={handleChange}
                  placeholder="opsional"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* ✔ BARU – Kepemilikan Buku KIA */}
              <div>
                <label className="block text-sm font-semibold mb-1">Kepemilikan Buku KIA <span className="text-xs text-red-500">*</span></label>
                <select
                  name="kepemilikanBukuKIA"
                  value={formData.kepemilikanBukuKIA}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                >
                  <option value="Ya">Ya</option>
                  <option value="Tidak">Tidak</option>
                </select>
              </div>

              {/* ✔ BARU – Nama Suami */}
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Suami <span className="text-xs text-red-500">*</span></label>
                <input
                  type="text"
                  name="namaSuami"
                  value={formData.namaSuami}
                  onChange={handleChange}
                  placeholder="Nama lengkap suami"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* ✔ BARU – HP Suami */}
              <div>
                <label className="block text-sm font-semibold mb-1">Nomor HP Suami <span className="text-xs text-red-500">*</span></label>
                <input
                  type="text"
                  name="HPSuami"
                  value={formData.HPSuami}
                  onChange={handleChange}
                  placeholder="contoh: 08123456789"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* Alamat */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1">Alamat</label>
                <input
                  type="text"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  placeholder="Alamat lengkap"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* ✔ BARU – RT/RW */}
              <div>
                <label className="block text-sm font-semibold mb-1">RT</label>
                <input
                  type="text"
                  name="RT"
                  value={formData.RT}
                  onChange={handleChange}
                  placeholder="RT"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">RW</label>
                <input
                  type="text"
                  name="RW"
                  value={formData.RW}
                  onChange={handleChange}
                  placeholder="RW"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* Koordinat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                <div>
                  <label className="block text-sm font-semibold mb-1">Longitude</label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    readOnly
                    placeholder="Klik Ambil Koordinat"
                    className="w-full px-4 py-2 border rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Latitude</label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    readOnly
                    placeholder="Klik Ambil Koordinat"
                    className="w-full px-4 py-2 border rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className="mt-2 text-sm text-green-600 font-medium hover:underline"
                  >
                    📍 Ambil dari Peta
                  </button>
                </div>
              </div>

              {/* Posyandu */}
              <div>
                <label className="block text-sm font-semibold mb-1">Posyandu</label>
                <input
                  type="text"
                  value={
                    sessionKader
                      ? `${sessionKader.posyandu.nama} (${sessionKader.posyandu.wilayah}) ${sessionKader.posyandu.kelurahan.nama}`
                      : 'Memuat...'
                  }
                  readOnly
                  className="w-full px-4 py-2 border rounded-xl bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Kader */}
              <div>
                <label className="block text-sm font-semibold mb-1">Kader</label>
                <input
                  type="text"
                  value={sessionKader?.nama || 'Memuat...'}
                  readOnly
                  className="w-full px-4 py-2 border rounded-xl bg-gray-100 cursor-not-allowed"
                />
              </div>

            </div>

            {/* Tombol */}
            <div className="flex justify-end gap-3 pt-6">
              <ButtonBatal onClick={() => router.back()} />
              <ButtonUpdate loading={loading} />
            </div>
          </form>
        </div>
      </div>

      {/* Modal Ambil Koordinat */}
      {showMap && (
        <ModalAmbilKoordinat
          onPick={(lat, lng) => {
            setFormData({
              ...formData,
              latitude: lat.toString(),
              longitude: lng.toString(),
            });
            setShowMap(false);
          }}
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  );
}
