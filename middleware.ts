// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/tentang",
  "/kontak",
  "/auth/login",
  "/auth/register",
  "/auth/verify-otp",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Lewati middleware untuk route API dan NextAuth
  if (
    pathname.startsWith("/api") || // ← penting agar next-auth tidak error
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // 2. Ambil token dari cookie
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAuth = !!token;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // 3. Jika user sudah login tapi akses halaman public → arahkan ke dashboard
  if (isPublicRoute && isAuth) {
    const role = token?.role;

    let redirectPath = "/dashboard"; // fallback jika role tidak dikenali
    if (role === "admin") redirectPath = "/dashboard/admin";
    else if (role === "kader") redirectPath = "/dashboard/kader";
    else if (role === "ibu_hamil") redirectPath = "/dashboard/ibu-hamil";
    else if (role === "orang_tua_balita") redirectPath = "/dashboard/orang-tua-balita";
    else if (role === "pemegang_program_imunisasi") redirectPath = "/dashboard/pempro-imunisasi";
    else if (role === "pemegang_program_kia") redirectPath = "/dashboard/pempro-kia";
    else if (role === "pemegang_program_gizi") redirectPath = "/dashboard/pempro-gizi";

    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  // 4. Jika user belum login tapi akses halaman private → arahkan ke login
  if (!isPublicRoute && !isAuth) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // 5. Jika user mencoba akses halaman role lain → blokir
  if (isAuth) {
    const role = token?.role;

    // Daftar prefix yang diizinkan per role
    const roleAccessMap: Record<string, string> = {
      admin: "/dashboard/admin",
      kader: "/dashboard/kader",
      ibu_hamil: "/dashboard/ibu-hamil",
      orang_tua_balita: "/dashboard/orang-tua-balita",
      pemegang_program_imunisasi: "/dashboard/pempro-imunisasi",
      pemegang_program_kia: "/dashboard/pempro-kia",
      pemegang_program_gizi: "/dashboard/pempro-gizi",
    };

    const allowedPrefix = roleAccessMap[role || ""];

    // Cek apakah user mencoba akses halaman yang tidak sesuai rolenya
    if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
      return NextResponse.redirect(new URL(allowedPrefix, req.url));
    }
  }

  return NextResponse.next();
}

// 6. Match semua route, kecuali static dan API
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|desktop.png|desktop2.png|desktop3.png|desktop4.png|mobile.png|logo.png|logo3.png).*)",
  ],
};
