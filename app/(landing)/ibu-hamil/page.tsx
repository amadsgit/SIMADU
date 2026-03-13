import NavbarLanding from '@/app/ui/landing/navbar-landing';
import FooterLanding from '@/app/ui/landing/footer-landing';
import { getTotalPosyandu } from '@/lib/data-posyandu';
import { getTotalKader } from '@/lib/data-kader';
import { getTotalBalita } from '@/lib/data-balita';
import { getTotalIbuHamil } from '@/lib/data-ibu-hamil';
import MapBumil from './map-bumil';

export const metadata = {
  title: 'Dashboard Publik | UPTD Puskesmas Cikalapa',
  description:
    'Informasi peta sebaran posyandu, balita, dan ibu hamil wilayah kerja UPTD Puskesmas Cikalapa.',
};

export default async function Page() {
  const totalPosyandu = await getTotalPosyandu();
  const totalKader = await getTotalKader();
  const totalBalita = await getTotalBalita();
  const totalIbuHamil = await getTotalIbuHamil();

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-white via-emerald-50/40 to-white text-gray-800 mt-20">
      <NavbarLanding />

      {/* WRAPPER */}
      <div className=" mt-6 md:px-10 lg:px-14 flex gap-6">
        {/* MAIN CONTENT */}
        <section className="flex-1">
          {/* MAP WRAPPER */}
          <div className="bg-white rounded-sm border border-emerald-100 shadow-md overflow-hidden">
            <div className="px-6 py-5 border-b border-emerald-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-emerald-600">
                Peta Sebaran Ibu Hamil
              </h2>
              <span className="text-xs text-gray-500">
                Wilayah kerja UPTD Puskesmas Cikalapa
              </span>
            </div>

            <div className="p-4">
              <MapBumil />
            </div>
          </div>

          {/* STATISTIK */}
          {/* <div className=" mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Posyandu', value: totalPosyandu?.toString() || '0', icon: '🏥' },
              { label: 'Kader', value: totalKader?.toString() || '0', icon: '👩‍⚕️' },
              { label: 'Balita', value: totalBalita?.toString() || '0', icon: '🧒' },
              { label: 'Ibu Hamil', value: totalIbuHamil?.toString() || '0', icon: '🤰' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-xl border border-emerald-100 shadow-lg rounded-sm p-5 hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-2">{item.icon}</div>
                <h3 className="text-2xl font-bold text-emerald-700">{item.value}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.label}</p>
              </div>
            ))}
          </div> */}
        </section>
      </div>

      <FooterLanding />
    </main>
  );
}
