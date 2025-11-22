import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth-options";

// ========================================================
// GET: Ambil balita sesuai noKK user yang login (Orang Tua Balita)
// ========================================================
export async function GET() {
  try {
    // Ambil session user login
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ambil data user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { noKK: true, role: { select: { nama: true } } },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Pastikan hanya role Orang Tua Balita yang bisa akses
    if (user.role.nama.toLowerCase() !== 'orang tua balita') {
      return NextResponse.json(
        { error: 'Akses ditolak.' },
        { status: 403 }
      );
    }

    // Ambil balita dengan noKK sama dengan user.noKK
    const balitaList = await prisma.balita.findMany({
      where: { noKK: user.noKK },
      include: {
        pemeriksaanBalita: true,
        statusGizi: true,
        posyandu: {
          select: {
            id: true,
            nama: true,
            alamat: true,
            wilayah: true,
            kelurahan: {
              select: { id: true, nama: true },
            },
          },
        },
        kader: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
      orderBy: { nama: 'asc' }, // opsional: urutkan berdasarkan nama
    });

    return NextResponse.json({
      success: true,
      data: balitaList,
    });
  } catch (error: any) {
    console.error('[GET Balita by User]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data balita.', detail: error.message },
      { status: 500 }
    );
  }
}
