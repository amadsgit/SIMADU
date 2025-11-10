import NavbarLanding from '@/app/ui/landing/navbar-landing';
import FooterLanding from '@/app/ui/landing/footer-landing';
import Image from 'next/image';
import { getTotalPosyandu } from '@/lib/data-posyandu';
import { getTotalKader } from '@/lib/data-kader';
import { getTotalBalita } from '@/lib/data-balita';
import { getTotalIbuHamil } from '@/lib/data-ibu-hamil';
import MapSection from './map-section';

export const metadata = {
  title: 'Sistem Informasi Manajemen Posyandu | UPTD Puskesmas Cikalapa',
  description:
    'Halaman resmi E-Posyandu - UPTD Puskesmas Cikalapa. Menampilkan data dan peta sebaran posyandu secara digital, profesional, dan terintegrasi.',
};

export default async function Page() {
  const totalPosyandu = await getTotalPosyandu();
  const totalKader = await getTotalKader();
  const totalBalita = await getTotalBalita();
  const totalIbuHamil = await getTotalIbuHamil();

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-white via-emerald-50 to-white text-gray-800">
      <NavbarLanding />

      {/* Header */}
      <section className="mx-4 md:mx-10 mt-8 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-10 md:py-14 gap-6">
          {/* Logo & Title */}
          <div className="flex items-center gap-6">
            <Image
              src="/logo3.png"
              alt="Logo Puskesmas Cikalapa"
              width={100}
              height={100}
              className="rounded-full bg-white p-2 shadow-md ring-4 ring-white/60"
              priority
            />
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                SIMADU
              </h1>
              <p className="text-emerald-100 text-base md:text-lg mt-1 leading-snug">
                <span className="font-semibold">Sistem Informasi Manajemen Posyandu</span>
                <br />
                UPTD Puskesmas Cikalapa
              </p>
            </div>
          </div>

          {/* Motto */}
          <div className="text-white text-sm md:text-base text-center md:text-right space-y-2 italic">
            <p className="text-emerald-50 font-light">
              “Melayani dengan data, mengabdi dengan hati.”
            </p>
            <p className="text-xs uppercase tracking-wide opacity-80">
              Terintegrasi • Realtime • Informatif
            </p>
          </div>
        </div>
      </section>

      {/* Statistik */}
      <section className="mt-14 mx-4 md:mx-10">
        <div className="bg-white rounded-3xl shadow-md border border-emerald-100 p-6 md:p-10">
          <h2 className="text-xl md:text-2xl font-semibold text-emerald-800 mb-6 text-center">
            Statistik Data Posyandu
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Posyandu Aktif', value: totalPosyandu?.toString() || '0' },
              { label: 'Kader Terdaftar', value: totalKader?.toString() || '0' },
              { label: 'Balita Terdata', value: totalBalita?.toString() || '0' },
              { label: 'Ibu Hamil Dipantau', value: totalIbuHamil?.toString() || '0' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group bg-gradient-to-b from-emerald-50 to-white border border-emerald-100 rounded-2xl py-8 text-center shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <h3 className="text-3xl md:text-4xl font-bold text-emerald-700">
                  {item.value}
                </h3>
                <p className="text-sm md:text-base text-gray-600 mt-2 group-hover:text-emerald-700">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Peta Sebaran */}
      <section className="mt-14 mx-4 md:mx-10">
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-md overflow-hidden">
          <div className="px-6 py-6 md:px-10 md:py-8 border-b border-emerald-100 flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-semibold text-emerald-800">
              Peta Sebaran Posyandu
            </h2>
            <p className="text-sm text-gray-500 hidden md:block">
              Data wilayah kerja UPTD Puskesmas Cikalapa
            </p>
          </div>
          <div className="p-4 md:p-6">
            <MapSection />
          </div>
        </div>
      </section>

      <FooterLanding />
    </main>
  );
}
