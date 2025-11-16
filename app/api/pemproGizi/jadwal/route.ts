import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// ========================================
// GET: Ambil semua jadwal kegiatan Gizi
// ========================================
export async function GET() {
  try {
    const jadwalGizi = await prisma.kegiatan.findMany({
      where: {
        programKesehatan: {
          nama: {
            contains: 'Program Gizi',
            mode: 'insensitive',
          },
        },
      },
      include: {
        posyandu: {
          select: {
            id: true,
            nama: true,
            alamat: true,
            wilayah: true,
            kelurahan: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
        programKesehatan: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
      orderBy: {
        tanggalPelaksanaan: 'desc',
      },
    });

    return NextResponse.json(jadwalGizi);
  } catch (error) {
    console.error('[GET pemproGiziJadwal]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data jadwal kegiatan Gizi' },
      { status: 500 }
    );
  }
}


// ========================================
// POST: Tambah jadwal kegiatan Gizi
// ========================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nama, deskripsi, tanggalPelaksanaan, alamat, posyanduId } = body;

    if (!nama || !tanggalPelaksanaan || !alamat || !posyanduId) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi!' },
        { status: 400 }
      );
    }

    // Ambil program kesehatan dengan nama sesuai database
    const programGizi = await prisma.programKesehatan.findFirst({
      where: {
        nama: {
          contains: 'Program Gizi', // <- pastikan sama persis
          mode: 'insensitive',
        },
      },
    });

    if (!programGizi) {
    console.log('DEBUG: daftar program kesehatan =', await prisma.programKesehatan.findMany());
      return NextResponse.json(
        { error: 'Program kesehatan Gizi tidak ditemukan!' },
        { status: 404 }
      );
    }

    const newKegiatan = await prisma.kegiatan.create({
      data: {
        nama,
        deskripsi,
        tanggalPelaksanaan: new Date(tanggalPelaksanaan),
        alamat,
        posyanduId: Number(posyanduId),
        programKesehatanId: programGizi.id,
      },
      include: {
        posyandu: {
          select: { id: true, nama: true },
        },
        programKesehatan: {
          select: { id: true, nama: true },
        },
      },
    });

    return NextResponse.json({
      message: 'Jadwal kegiatan Gizi berhasil ditambahkan.',
      data: newKegiatan,
    });
  } catch (error) {
    console.error('[POST pemproGiziJadwal]', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan jadwal kegiatan Gizi' },
      { status: 500 }
    );
  }
}
