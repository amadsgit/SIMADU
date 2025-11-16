import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// ========================================
// GET: Ambil semua jadwal kegiatan KIA
// ========================================
export async function GET() {
  try {
    const jadwalKIA = await prisma.kegiatan.findMany({
      where: {
        programKesehatan: {
          nama: {
            contains: 'Program KIA',
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
    // console.log(JSON.stringify(jadwalImunisasi, null, 2));


    return NextResponse.json(jadwalKIA);
  } catch (error) {
    console.error('[GET pemproKiaJadwal]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data jadwal kegiatan KIA' },
      { status: 500 }
    );
  }
}


// ========================================
// POST: Tambah jadwal kegiatan KIA
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
    const programKIA = await prisma.programKesehatan.findFirst({
      where: {
        nama: {
          contains: 'Program KIA', // <- pastikan sama persis
          mode: 'insensitive',
        },
      },
    });

    if (!programKIA) {
    console.log('DEBUG: daftar program kesehatan =', await prisma.programKesehatan.findMany());
      return NextResponse.json(
        { error: 'Program kesehatan KIA tidak ditemukan!' },
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
        programKesehatanId: programKIA.id,
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
      message: 'Jadwal kegiatan KIA berhasil ditambahkan.',
      data: newKegiatan,
    });
  } catch (error) {
    console.error('[POST pemproKiaJadwal]', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan jadwal kegiatan KIA' },
      { status: 500 }
    );
  }
}
