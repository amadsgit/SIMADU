export const metadata = {
  title: 'Kontak | E‑Posyandu Care',
  description: 'Digitalisasi layanan posyandu untuk masyarakat sehat dan terdata',
};

import NavbarLanding from '@/app/ui/landing/navbar-landing';
import FooterLanding from '@/app/ui/landing/footer-landing';
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function KontakPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-white via-emerald-50 to-white text-gray-800">
      {/* Navbar */}
      <NavbarLanding />

      {/* Hero Header */}
      <section className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 rounded-xl shadow-xl mx-4 md:mx-6 mt-6 px-6 md:px-12 py-8 md:py-12 text-white text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold drop-shadow">Kontak Kami</h1>
        <p className="mt-2 text-sm md:text-base max-w-2xl">
          Hubungi kami jika ada pertanyaan dan saran terkait kegiatan posyandu di wilayah kerja UPTD Puskesmas Cikalapa.
        </p>
      </section>

      {/* Konten utama */}
      <section className="mt-10 px-6 md:px-16 flex flex-col md:flex-row gap-12 md:gap-20 items-start">
        {/* Informasi Kontak */}
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-2xl font-semibold text-emerald-700">Informasi Kontak</h2>
          <ul className="text-gray-700 space-y-5 text-sm md:text-base">
            <li className="flex items-start gap-4">
              <MapPinIcon className="w-6 h-6 text-emerald-600 mt-1" />
              <span>
                Jl. Pulau Kalimantan No.39 Kelurahan Pasirkareumbi Kec.Subang Kad.Subang - Jawa Barat.
              </span>
            </li>
            <li className="flex items-start gap-4">
              <PhoneIcon className="w-6 h-6 text-emerald-600 mt-1" />
              <span>+62 812-8620-8542 (Admin Posyandu)</span>
            </li>
            <li className="flex items-start gap-4">
              <EnvelopeIcon className="w-6 h-6 text-emerald-600 mt-1" />
              <span>puskesmascikalapa@gmail.com</span>
            </li>
          </ul>
        </div>

        {/* Form Kontak */}
        <div className="md:w-1/2 w-full bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-emerald-700 mb-4">Kirim Pesan</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama</label>
              <input
                type="text"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="email@contoh.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pesan</label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Tulis pesan kamu di sini..."
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 text-white font-medium py-2 px-6 rounded hover:bg-emerald-500 transition"
            >
              Kirim
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <FooterLanding />
    </main>
  );
}
