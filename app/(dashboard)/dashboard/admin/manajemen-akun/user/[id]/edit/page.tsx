'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import ButtonUpdate from '@/components/button-update';
import ButtonBatal from '@/components/button-batal';

type Role = {
  id: string;
  nama: string;
};

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams(); // ambil userId dari URL misal /dashboard/admin/manajemen-akun/user/[id]/edit
  const namaRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    noHp: '',
    noKK: '',
    nik: '',
    tanggalLahir: '',
    alamat: '',
    password: '',
    roleId: '',
  });

  const [roleList, setRoleList] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nikError, setNikError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Fokus otomatis
  useEffect(() => {
    if (namaRef.current) namaRef.current.focus();
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch('/api/role');
        if (!res.ok) throw new Error('Gagal memuat data role');
        const data = await res.json();

        // Filter role yang boleh dipilih
        const filtered = data.filter((r: Role) =>
          ['admin', 'kader', 'pemegang program kia', 'pemegang program imunisasi', 'pemegang program gizi'].includes(r.nama.toLowerCase())
        );
        setRoleList(filtered);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat data role!');
      }
    };
    fetchRoles();
  }, []);

  // Ambil data user berdasarkan ID
  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/user/${id}`);
        if (!res.ok) throw new Error('Gagal memuat data user');
        const data = await res.json();
        setFormData({
          nama: data.nama || '',
          email: data.email || '',
          noHp: data.noHp || '',
          noKK: data.noKK || '',
          nik: data.nik || '',
          tanggalLahir: data.tanggalLahir?.split('T')[0] || '',
          alamat: data.alamat || '',
          password: '',
          roleId: data.roleId || '',
        });
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat data user!');
      }
    };
    fetchUser();
  }, [id]);

  // Validasi realtime
  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Email realtime
    if (name === 'email') {
      if (!value.includes('@')) {
        setEmailError('Format email tidak valid');
        return;
      }
      try {
        const res = await fetch(`/api/check-email-nik?email=${value}&excludeId=${id}`);
        const data = await res.json();
        if (data.exists) setEmailError('Email sudah terdaftar');
        else setEmailError(null);
      } catch {
        setEmailError('Gagal memeriksa email');
      }
    }

    // NIK realtime
    if (name === 'nik') {
      if (value.length !== 16) {
        setNikError('NIK harus 16 digit');
        return;
      }
      try {
        const res = await fetch(`/api/check-email-nik?nik=${value}&excludeId=${id}`);
        const data = await res.json();
        if (data.exists) setNikError('NIK sudah terdaftar');
        else setNikError(null);
      } catch {
        setNikError('Gagal memeriksa NIK');
      }
    }

    // Password minimal 8 karakter
    if (name === 'password') {
      if (value && value.length < 8)
        setPasswordError('Password minimal 8 karakter');
      else setPasswordError(null);
    }
  };

  // Submit edit user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emailError || nikError || passwordError) {
      toast.error('Perbaiki kesalahan input terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui user');

      toast.success('Data user berhasil diperbarui!');
      router.push('/dashboard/admin/manajemen-akun/user');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Terjadi kesalahan saat memperbarui data!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-3 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="p-6 border bg-white shadow-md rounded-xl">
          <h1 className="text-2xl font-bold mb-8">
            Edit <span className="text-emerald-700">User</span>
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-8">
              {/* --- Nama Lengkap --- */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  ref={namaRef}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* --- Email & No HP --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-2 outline-none transition ${
                      emailError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-emerald-400'
                    }`}
                  />
                  {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    No. HP
                  </label>
                  <input
                    type="tel"
                    name="noHp"
                    maxLength={13}
                    value={formData.noHp}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none transition"
                  />
                </div>
              </div>

              {/* --- NIK & No KK --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    NIK
                  </label>
                  <input
                    type="text"
                    name="nik"
                    value={formData.nik}
                    maxLength={16}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-2 outline-none transition ${
                      nikError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-emerald-400'
                    }`}
                  />
                  {nikError && <p className="text-xs text-red-500 mt-1">{nikError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nomor KK
                  </label>
                  <input
                    type="text"
                    name="noKK"
                    maxLength={16}
                    value={formData.noKK}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none transition"
                  />
                </div>
              </div>

              {/* --- Tanggal Lahir --- */}
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

              {/* --- Alamat --- */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Alamat
                </label>
                <input
                  type="text"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* --- Role & Password --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    name="roleId"
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Password (Opsional)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Kosongkan jika tidak diubah"
                    className={`w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-2 outline-none transition ${
                      passwordError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-emerald-400'
                    }`}
                  />
                  {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
                </div>
              </div>

              {/* --- Tombol --- */}
              <div className="flex justify-end gap-3 pt-8">
                <ButtonBatal onClick={() => router.back()} />
                <ButtonUpdate loading={loading} />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
