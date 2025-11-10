# 🌿 Sistem Informasi Manajemen Posyandu

Aplikasi SIMADU adalah sistem informasi berbasis web yang dibangun untuk mendukung digitalisasi layanan Posyandu. Aplikasi ini memungkinkan pengelolaan data wilayah, posyandu, kader, dan pengguna berbasis autentikasi, serta mendukung manajemen peran berbasis role. dan state global melalui Redux.

---

## Fitur Utama

### Autentikasi Aman (NextAuth.js + OTP)

- Login dan register menggunakan **NextAuth.js**
- Verifikasi OTP saat Register user baru
- Middleware route untuk membatasi akses berdasarkan role dan status login
- Redirect dinamis sesuai role user:
  - Admin → `/dashboard/admin`
  - Kader → `/dashboard/kader`
  - Ibu Hamil → `/dashboard/ibu-hamil`
  - Orang Tua Balita → `/dashboard/orang-tua-balita`

---

### CRUD Sistem

##### ✔ Kelurahan

- Tambah, ubah, dan hapus data kelurahan

##### ✔ Posyandu

- Tambah, lihat, ubah, dan hapus data posyandu (terkait dengan kelurahan), kelola kader

##### ✔ Kader

- CRUD kader berdasarkan posyandu
- Menggunakan **Redux** untuk manajemen state form & daftar kader

##### ✔ Role

- Kelola role pengguna (admin, kader, ibu hamil, orang tua balita)

##### ✔ User

- Kelola user, role.

---

### Middleware Route Management

- Middleware **publicRoute**: redirect user login yang mencoba akses halaman publik (login/register)
- Middleware **authRoute**: proteksi halaman dashboard untuk user yang belum login
- Middleware **roleRoute**: hanya role tertentu yang boleh mengakses halaman berdasarkan prefix (misal: `/admin`, `/kader`)
- Middleware menggunakan prefix dinamis (`/admin`, `/kader`, dll)

---

## UI/UX Menggunakan Tailwind UI

- Komponen dari Tailwind UI digunakan untuk membuat antarmuka yang profesional dan responsif
- Tidak menggunakan template dashboard dari pihak ketiga
- Responsive mobile-first layout

---

## Deployment

- Aplikasi sepenuhnya **deployed di Vercel**
- Terhubung dengan **PostgreSQL database (Neon)**
- Koneksi database aman melalui `.env` dan dikonfigurasi di Vercel Environment Variables

---

## Teknologi yang Digunakan

| Teknologi         | Keterangan                         |
| ----------------- | ---------------------------------- |
| Next.js 15        | Framework React dengan App Router  |
| Tailwind CSS      | Styling utility-first              |
| Tailwind UI       | Komponen UI modern                 |
| NextAuth.js       | Autentikasi berbasis session & OTP |
| Redux Toolkit     | State management untuk fitur Kader |
| Prisma ORM        | Mapping database PostgreSQL        |
| PostgreSQL (Neon) | Database utama                     |
| Vercel            | Platform hosting dan deployment    |


## Autentikasi dengan OTP

- Setiap registrasi akan mengirim OTP ke email
- OTP memiliki masa aktif 10 menit
- User harus memverifikasi OTP sebelum bisa mengakses sistem
- OTP dikirim menggunakan email SMTP Gmail

---

## Fitur Tambahan

- Toast notifikasi menggunakan `react-hot-toast`
- Validasi form menggunakan `Zod`
- pencarian untuk list data posyandu

## Demo Live

🔗 

---

## Developer

- Nama: Mamad Ahmad
- Tech Stack: Next.js, Tailwind, NextAuth.js, PostgreSQL


