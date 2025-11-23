import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth-options";

// ========================================================
// GET: Ambil balita + jadwal kegiatan (yang sudah berjalan)
//      + jadwal kegiatan yang BELUM dimulai dari tabel Kegiatan
// ========================================================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ambil info user login
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

    if (user.role.nama.toLowerCase() !== 'orang tua balita') {
      return NextResponse.json(
        { error: 'Akses ditolak.' },
        { status: 403 }
      );
    }

    // Ambil semua balita milik user berdasarkan noKK
    const balitaList = await prisma.balita.findMany({
      where: { noKK: user.noKK },
      orderBy: { nama: 'asc' },
    });

    const posyanduIds = balitaList.map((b) => b.posyanduId);

    // ----------------------------------------------------
    // 1. JADWAL KEGIATAN YANG SUDAH TERJADWAL
    // ----------------------------------------------------
    const kegiatanList = await prisma.pelaksanaanKegiatan.findMany({
      where: {
        posyanduId: { in: posyanduIds },
      },
      include: {
        kegiatan: true,
        posyandu: {
          select: {
            id: true,
            nama: true,
            alamat: true,
            wilayah: true,
            kelurahan: { select: { id: true, nama: true } }
          }
        },
        kader: { select: { id: true, nama: true }},
        pemeriksaanBalita: {
          select: {
            balitaId: true,
            balita: { select: { nama: true } }
          }
        }
      },
      orderBy: { tanggalMulai: 'asc' },
    });

    // ----------------------------------------------------
    // 2. JADWAL KEGIATAN YANG BELUM DIMULAI (TABEL KEGIATAN)
    // ----------------------------------------------------
    const upcomingKegiatan = await prisma.kegiatan.findMany({
      where: {
        posyanduId: { in: posyanduIds },
        tanggalPelaksanaan: {
          gt: new Date(), // belum mulai
        },
      },
      orderBy: { tanggalPelaksanaan: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        balita: balitaList,
        jadwalKegiatan: kegiatanList, // sudah terjadwal
        jadwalMendatang: upcomingKegiatan, // upcoming
      },
    });

  } catch (error: any) {
    console.error('[GET Balita + Jadwal]', error);
    return NextResponse.json(
      {
        error: 'Gagal mengambil data balita dan jadwal kegiatan.',
        detail: error.message
      },
      { status: 500 }
    );
  }
}
