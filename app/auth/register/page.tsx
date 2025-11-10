'use client';

import { useState, useEffect } from 'react';
import { UserIcon, MailIcon, PhoneIcon, CalendarIcon, HomeIcon, FingerprintIcon, CardSimIcon, LockIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [form, setForm] = useState({
    nama: '',
    email: '',
    noHp: '',
    noKK: '',
    nik: '',
    alamat: '',
    tanggalLahir: '',
    role: '',
    password: '',
    confirmPassword: '',
  });

  const [isPasswordMatch, setIsPasswordMatch] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [errors, setErrors] = useState({ password: '' });
  const [errornik, setErrorNik] = useState({ nik: '' });
  const [errornoKK, setErrornoKK] = useState({ noKK: '' });

  // get data role
  const [roleOptions, setRoleOptions] = useState<{ id: string; nama: string; slug: string }[]>([]);
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch('/api/role');
        const data = await res.json();
        // const filtered = data.filter(
        //   (role: { slug: string }) =>
        //     role.slug === 'ibu_hamil' || role.slug === 'orang_tua_balita'
        // );
        // setRoleOptions(filtered);
        setRoleOptions(data);
      } catch (error) {
        console.error('Gagal memuat role:', error);
      }
    };

    fetchRoles();
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    // Validasi langsung nik
    if (name === 'nik') {
      if (value.length < 16) {
        setErrorNik(prev => ({ ...prev, nik: 'Nomor NIK harus 16 digit' }));
      } else {
        setErrorNik(prev => ({ ...prev, nik: '' }));
      }
    }

    // Validasi langsung noKK
    if (name === 'noKK') {
      if (value.length < 16) {
        setErrornoKK(prev => ({ ...prev, noKK: 'Nomor KK harus 16 digit' }));
      } else {
        setErrornoKK(prev => ({ ...prev, noKK: '' }));
      }
    }

    // Validasi langsung password
    if (name === 'password') {
      if (value.length < 6) {
        setErrors(prev => ({ ...prev, password: 'Password minimal 6 karakter' }));
      } else {
        setErrors(prev => ({ ...prev, password: '' }));
      }
    }


    // validasi langsung saat input
    if (name === 'password' || name === 'confirmPassword') {
      setIsPasswordMatch(updatedForm.password === updatedForm.confirmPassword);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Password dan konfirmasi tidak cocok!');
      return;
    }

    setIsSubmitting(true);

    const cleanedForm = {
      nama: form.nama,
      email: form.email,
      noHp: form.noHp.replace(/\D/g, ''),
      noKK: form.noKK?.replace(/\D/g, ''),
      nik: form.nik.replace(/\D/g, ''),
      alamat: form.alamat,
      tanggalLahir: form.tanggalLahir,
      password: form.password,
      roleId: form.role,
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedForm),
      });

      const result = await res.json();

      if (!res.ok) {
        // Tangani status error apa pun, termasuk 409
        toast.error(result.message || 'Gagal mendaftar, silahkan coba lagi!');
        return;
      }

      // Jika berhasil (res.ok === true, status 201)
      toast.success('Pendaftaran berhasil! Kode OTP dikirim ke email.');
      localStorage.setItem('registerEmail', form.email);

      setTimeout(() => {
        router.push(`/auth/verify-otp?email=${encodeURIComponent(cleanedForm.email)}`);
      }, 1500);
 
    } catch (error) {
      console.error('Error saat submit:', error);
      toast.error('Terjadi kesalahan saat pendaftaran!');
    } finally {
      setIsSubmitting(false);
    }
  };


  // catatan 
  // useEffect(() => {
  //   toast.custom((t) => (
  //     <div className="fixed top-4 left-2 z-20">
  //       <div
  //         className={`${
  //           t.visible ? 'animate-enter' : 'animate-leave'
  //         } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
  //       >
  //         <div className="flex-1 w-500 p-4">
  //           <div className="flex items-start">
  //             <div className="flex-shrink-0 pt-0.5">
  //             </div>
  //             <div className="ml-3 flex-1">
  //               <p className="text-sm text-gray-900">
  //                 untuk real project kedepannya user dengan role admin & kader hanya akan didaftarkan didalam sistem oleh admin, form register hanya untuk ibu hamil & orang tua balita.
  //               </p>
  //             </div>
  //           </div>
  //         </div>
  //         <div className="flex border-l border-gray-200">
  //           <button
  //             onClick={() => toast.dismiss(t.id)}
  //             className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-teal-600 hover:text-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
  //           >
  //             Tutup
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   ));
  // }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 to-green-600 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-xl p-8 my-4 space-y-6">
        <div className="text-center">
          <img src="/logo3.png" alt="Logo" className="h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Daftar e-Posyandu</h2>
          <p className="text-sm text-gray-500">Untuk Ibu Hamil dan Ibu Balita</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              name="nama"
              type="text"
              value={form.nama}
              onChange={handleChange}
              placeholder="Nama Lengkap"
              required
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <UserIcon className="w-5 h-5 absolute top-2.5 left-3 text-gray-400" />
          </div>

          <div className="relative">
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email aktif"
              required
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <MailIcon className="w-5 h-5 absolute top-2.5 left-3 text-gray-400" />
          </div>

          <div className="relative">
            <input
              name="noHp"
              type="tel"
              value={form.noHp}
              onChange={handleChange}
              placeholder="Nomor HP"
              maxLength={13}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 16);
              }}
              required
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <PhoneIcon className="w-5 h-5 absolute top-2.5 left-3 text-gray-400" />
          </div>

          <div className="relative">
            <input
              name="noKK"
              type="text"
              value={form.noKK}
              onChange={handleChange}
              maxLength={16}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 16);
              }}
              placeholder="Nomor Kartu Keluarga"
              required
              className={`w-full px-4 py-2 pl-10 border rounded-md focus:ring-2 focus:outline-none ${
                errornoKK.noKK ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
              }`}
            />
            <CardSimIcon className="w-5 h-5 absolute top-2.5 left-3 text-gray-400" />
          </div>
          {errornoKK.noKK && (
            <p className="text-sm text-red-600 mt-1">{errornoKK.noKK}</p>
          )}

          <div className="relative">
            <input
              name="nik"
              type="text"
              value={form.nik}
              onChange={handleChange}
              maxLength={16}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 16);
              }}
              placeholder="NIK"
              required
              className={`w-full px-4 py-2 pl-10 border rounded-md focus:ring-2 focus:outline-none ${
                errornik.nik ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
              }`}
            />
            <FingerprintIcon className="w-5 h-5 absolute top-2.5 left-3 text-gray-400" />
          </div>
          {errornik.nik && (
            <p className="text-sm text-red-600 mt-1">{errornik.nik}</p>
          )}

          <div className="relative">
            <input
              name="alamat"
              type="text"
              value={form.alamat}
              onChange={handleChange}
              placeholder="Alamat Lengkap"
              required
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <HomeIcon className="w-5 h-5 absolute top-2.5 left-3 text-gray-400" />
          </div>

          <div>
            <label htmlFor="tanggalLahir" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Lahir
            </label>
            <div className="relative">
              <input
                name="tanggalLahir"
                id="tanggalLahir"
                type="date"
                value={form.tanggalLahir}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <CalendarIcon className="w-5 h-5 absolute top-2.5 left-3 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pendaftaran</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">Pilih jenis pendaftaran</option>
              {roleOptions.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className={`w-full px-4 py-2 pl-10 border rounded-md focus:ring-2 focus:outline-none ${
                errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
              }`}
            />
            <LockIcon className="w-5 h-5 absolute top-2.5 left-3 text-gray-400" />
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">{errors.password}</p>
          )}

          <div className="relative">
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Konfirmasi Password"
              required
              className={`w-full px-4 py-2 pl-10 border rounded-md focus:ring-2 focus:outline-none ${
                isPasswordMatch
                  ? 'border-gray-300 focus:ring-teal-500'
                  : 'border-red-500 focus:ring-red-500'
              }`}
            />
            <LockIcon className="w-5 h-5 absolute top-2.5 left-3 text-gray-400" />
          </div>
          {!isPasswordMatch && (
            <p className="text-sm text-red-500 -mt-2">Konfirmasi password tidak sama</p>
          )}

          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Mendaftar...</span>
              </>
            ) : (
              'Daftar'
            )}
          </button>

          <div className="text-center text-sm text-gray-500">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-teal-600 hover:underline">
              Login di sini
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}