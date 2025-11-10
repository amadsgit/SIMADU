'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ButtonSimpan from '@/components/button-simpan';
import ButtonBatal from '@/components/button-batal';

type Role = {
  id: string;
  nama: string;
};

type Kader = {
  id: number;
  nama: string;
  nik: string;
  noHp: string;
  alamat: string;
  posyandu: {
    nama: string;
    wilayah: string;
    kelurahan?: {
      nama: string;
    } | null;
  } | null;
};

export default function Page() {
  const router = useRouter();
  const roleIdRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    noHp: '',
    noKK: '',
    nik: '',
    tanggalLahir: '',
    alamat: '',
    password: '',
    roleId: '',    // string (cuid)
    kaderId: '',   // string here for select value; convert to number on submit
  });

  const [roleList, setRoleList] = useState<Role[]>([]);
  const [kaderList, setKaderList] = useState<Kader[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nikError, setNikError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    roleIdRef.current?.focus();
  }, []);

  // Ambil daftar role
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch('/api/role');
        if (!res.ok) throw new Error('Gagal memuat role');
        const data = await res.json();
        // filter hanya role yang relevan
        const filtered = data.filter((r: Role) =>
          [
            'admin',
            'kader',
            'pemegang program kia',
            'pemegang program imunisasi',
            'pemegang program gizi',
          ].includes(r.nama.toLowerCase())
        );
        setRoleList(filtered);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat data role!');
      }
    };
    fetchRoles();
  }, []);

  // Ambil daftar kader kalau role = kader 
  useEffect(() => {
    const selectedRole = roleList.find((r) => r.id === formData.roleId);
    if (selectedRole?.nama.toLowerCase() === 'kader') {
      // fetch kader
      fetch('/api/kader/available')
        .then(async (res) => {
          if (!res.ok) throw new Error('Gagal memuat kader');
          return res.json();
        })
        .then((data) => setKaderList(data))
        .catch((err) => {
          console.error(err);
          toast.error('Gagal memuat data kader');
        });
    } else {
      setKaderList([]);
      setFormData((prev) => ({ ...prev, kaderId: '' }));
    }
  }, [formData.roleId, roleList]);

  // Handle input umum
  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'email') {
      if (!value.includes('@')) return setEmailError('Format email tidak valid');
      try {
        const res = await fetch(`/api/check-email-nik?email=${encodeURIComponent(value)}`);
        const data = await res.json();
        setEmailError(data.exists ? 'Email sudah terdaftar' : null);
      } catch {
        setEmailError('Gagal memeriksa email');
      }
    }

    if (name === 'nik') {
      if (value.length < 16) return setNikError('NIK harus 16 digit');
      try {
        const res = await fetch(`/api/check-email-nik?nik=${encodeURIComponent(value)}`);
        const data = await res.json();
        setNikError(data.exists ? 'NIK sudah terdaftar' : null);
      } catch {
        setNikError('Gagal memeriksa NIK');
      }
    }

    if (name === 'password') {
      setPasswordError(value.length < 8 ? 'Password minimal 8 karakter' : null);
    }
  };

  // Pilih kader -> isi otomatis data personal
  const handleKaderSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setFormData((prev) => ({ ...prev, kaderId: id }));

    const kader = kaderList.find((k) => k.id === Number(id));
    if (kader) {
      setFormData((prev) => ({
        ...prev,
        nama: kader.nama || '',
        nik: kader.nik || '',
        noHp: kader.noHp || '',
        alamat: kader.alamat || '',
      }));
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = [
      'nama',
      'email',
      'noHp',
      'nik',
      'tanggalLahir',
      'alamat',
      'password',
      'roleId',
    ];
    const isEmpty = requiredFields.some(
      (f) => !formData[f as keyof typeof formData]
    );
    if (isEmpty) return toast.error('Semua field wajib diisi!');
    if (emailError || passwordError || nikError)
      return toast.error('Perbaiki kesalahan input.');

    setLoading(true);
    try {
      // roleId tetap string (cuid), kaderId dikirim sebagai number atau null
      const payload = {
        ...formData,
        roleId: formData.roleId,
        kaderId: formData.kaderId ? Number(formData.kaderId) : null,
      };

      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Gagal menyimpan');
      toast.success(data.message || 'User berhasil ditambahkan!');
      router.push('/dashboard/admin/manajemen-akun/user');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleName =
    roleList.find((r) => r.id === formData.roleId)?.nama.toLowerCase() || '';

  return (
    <div className="px-3 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="p-6 border bg-white shadow-md rounded-xl">
          <h1 className="text-2xl font-bold mb-8">
            Tambah <span className="text-emerald-700">User Baru</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Role
              </label>
              <select
                name="roleId"
                // ref={roleIdRef}
                value={formData.roleId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm bg-white focus:ring-2 focus:ring-emerald-400 outline-none transition"
              >
                <option value="">-- Pilih Role --</option>
                {roleList.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.nama}
                  </option>
                ))}
              </select>
            </div>

            {selectedRoleName === 'kader' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Pilih Nama Kader
              </label>
              <select
                name="kaderId"
                value={formData.kaderId}
                onChange={handleKaderSelect}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm bg-white focus:ring-2 focus:ring-emerald-400 outline-none transition"
              >
                <option value="">-- Pilih Kader --</option>
                {kaderList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama} — {k.posyandu?.nama || '-'} ({k.posyandu?.wilayah || '-'}) Kel.
                    {k.posyandu?.kelurahan?.nama || '-'}
                  </option>
                ))}
              </select>
            </div>
          )}

            {/* Form Umum */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="nama"
                  // ref={namaRef}
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Contoh: Aisyah Rahma"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Contoh: aisyah@mail.com"
                  className={`w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-2 outline-none transition ${
                    emailError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-emerald-400'
                  }`}
                />
                {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  No HP
                </label>
                <input
                  type="tel"
                  name="noHp"
                  value={formData.noHp}
                  onChange={handleChange}
                  placeholder="081234567890"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  NIK
                </label>
                <input
                  type="text"
                  name="nik"
                  maxLength={16}
                  value={formData.nik}
                  onChange={handleChange}
                  placeholder="3201234567890001"
                  className={`w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-2 outline-none transition ${
                    nikError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-emerald-400'
                  }`}
                />
                {nikError && <p className="text-xs text-red-500 mt-1">{nikError}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Alamat
              </label>
              <input
                type="text"
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                placeholder="Jl. Melati No. 15"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  name="tanggalLahir"
                  value={formData.tanggalLahir}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 8 karakter"
                  className={`w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-2 outline-none transition ${
                    passwordError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-emerald-400'
                  }`}
                />
                {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <ButtonBatal onClick={() => router.back()} />
              <ButtonSimpan loading={loading} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
