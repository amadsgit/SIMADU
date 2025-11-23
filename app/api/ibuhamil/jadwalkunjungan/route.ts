import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth-options";

// ========================================================
// GET: Ambil ibuhamil + jadwal kegiatan (yang sudah berjalan)
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
      select: { nik: true, role: { select: { nama: true } } },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (user.role.nama.toLowerCase() !== 'ibu hamil') {
      return NextResponse.json(
        { error: 'Akses ditolak.' },
        { status: 403 }
      );
    }

    // Ambil semua ibu hamil milik user berdasarkan nik
    const ibuHamilList = await prisma.ibuHamil.findMany({
      where: { nik: user.nik },
      orderBy: { nama: 'asc' },
    });

    const posyanduIds = ibuHamilList.map((i) => i.posyanduId);

    // ----------------------------------------------------
    // 1. JADWAL KEGIATAN YANG SUDAH TERJADWAL
    // ----------------------------------------------------
    const kegiatanList = await prisma.pelaksanaanKegiatan.findMany({
      where: {
        posyanduId: { in: posyanduIds },
        kegiatan: {
          nama: {
            notIn: ["balita", "anak", "bayi", "stunting", "remaja"],
            mode: "insensitive"
          }
        }
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
        pemeriksaanIbuHamil: {
          select: {
            ibuHamilId: true,
            ibuHamil: { select: { nama: true } }
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
        tanggalPelaksanaan: { gt: new Date() },

        // Filter hanya kegiatan ibu hamil
        nama: {
          notIn: ["balita", "anak", "bayi", "stunting", "remaja"],
          mode: "insensitive"
        }
      },
      orderBy: { tanggalPelaksanaan: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        ibuHamil: ibuHamilList,
        jadwalKegiatan: kegiatanList, // sudah terjadwal
        jadwalMendatang: upcomingKegiatan, // upcoming
      },
    });

  } catch (error: any) {
    console.error('[GET ibuHamil + Jadwal]', error);
    return NextResponse.json(
      {
        error: 'Gagal mengambil data ibu hamil dan jadwal kegiatan.',
        detail: error.message
      },
      { status: 500 }
    );
  }
}
