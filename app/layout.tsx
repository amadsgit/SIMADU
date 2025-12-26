import '@/app/ui/global.css';
import type { Metadata } from "next";
import { Toaster } from 'react-hot-toast';
import 'react-confirm-alert/src/react-confirm-alert.css';
import NextAuthSession from "./NextAuthSession";

export const metadata: Metadata = {
  metadataBase: new URL("https://simaducikalapa.vercel.app/"),
  title: {
    default: "SIMADU | Sistem Informasi Manajemen Posyandu",
    template: "%s | SIMADU Puskesmas Cikalapa",
  },
  description:
    "SIMADU (Sistem Informasi Manajemen Posyandu) UPTD Puskesmas Cikalapa adalah sistem berbasis web untuk pengelolaan data Posyandu, ibu hamil, balita, imunisasi, dan laporan kesehatan secara terintegrasi.",
  keywords: [
    "SIMADU",
    "Sistem Informasi Manajemen Posyandu",
    "Sistem Informasi Posyandu",
    "Puskesmas Cikalapa",
    "UPTD Puskesmas Cikalapa",
    "Aplikasi Posyandu",
    "Manajemen Data Kesehatan",
    "Sistem Informasi Kesehatan",
    "Digitalisasi Posyandu"
  ],
  openGraph: {
    title: "SIMADU | Sistem Informasi Manajemen Posyandu",
    description:
      "Sistem informasi berbasis web untuk mendukung pengelolaan dan pelayanan Posyandu di UPTD Puskesmas Cikalapa.",
    url: "https://simadu-puskesmas-cikalapa.vercel.app",
    siteName: "SIMADU Puskesmas Cikalapa",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/og-image.png", // optional
        width: 1200,
        height: 630,
        alt: "SIMADU Puskesmas Cikalapa",
      },
    ],
  },
  alternates: {
    canonical: "https://simadu-puskesmas-cikalapa.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <NextAuthSession>
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </NextAuthSession>
      </body>
    </html>
  );
}
