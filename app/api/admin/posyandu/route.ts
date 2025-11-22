import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// ==================================================
// GET: Ambil semua data posyandu dan relasi kelurahan
// ==================================================
export async function GET() {
  try {
    const posyandu = await prisma.posyandu.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        kelurahan: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    return NextResponse.json(posyandu);
  } catch (error) {
    console.error('[GET Posyandu]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data posyandu' },
      { status: 500 }
    );
  }
}

// ==================================================
// POST: Tambah data posyandu baru dengan validasi unik
// ==================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nama,
      alamat,
      wilayah,
      kelurahanId,
      penanggungJawab,
      noHp,
      akreditasi,
      longitude,
      latitude,
    } = body;

    // Validasi wajib isi
    if (
      !nama ||
      !alamat ||
      !wilayah ||
      !kelurahanId ||
      !penanggungJawab ||
      !noHp ||
      !akreditasi ||
      longitude === undefined ||
      latitude === undefined
    ) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi.' },
        { status: 400 }
      );
    }

    // Validasi enum akreditasi
    const validAkreditasi = [
      'PARIPURNA',
      'PRATAMA',
      'MADYA',
      'PURNAMA',
      'MANDIRI',
      'BELUM_AKREDITASI',
    ];
    if (!validAkreditasi.includes(akreditasi)) {
      return NextResponse.json(
        { error: 'Akreditasi tidak valid.' },
        { status: 400 }
      );
    }

    // Convert tipe data
    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const kelurahanIdInt = parseInt(kelurahanId);
    if (isNaN(lon) || isNaN(lat) || isNaN(kelurahanIdInt)) {
      return NextResponse.json(
        { error: 'Longitude, Latitude, dan Kelurahan ID harus berupa angka.' },
        { status: 400 }
      );
    }

    // alidasi nama Posyandu unik (case insensitive)
    const existing = await prisma.posyandu.findFirst({
      where: {
        nama: {
          equals: nama,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Nama Posyandu sudah terdaftar. Gunakan nama lain.' },
        { status: 409 } // Conflict
      );
    }

    // Simpan data baru
    const newPosyandu = await prisma.posyandu.create({
      data: {
        nama,
        alamat,
        wilayah,
        kelurahanId: kelurahanIdInt,
        penanggungJawab,
        noHp,
        akreditasi,
        longitude: lon,
        latitude: lat,
      },
    });

    return NextResponse.json(newPosyandu, { status: 201 });
  } catch (error) {
    console.error('[POST Posyandu]', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan data posyandu.' },
      { status: 500 }
    );
  }
}
