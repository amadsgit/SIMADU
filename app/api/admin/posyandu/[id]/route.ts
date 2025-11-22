import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: Ambil detail Posyandu berdasarkan ID, termasuk relasi kelurahan
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const posyandu = await prisma.posyandu.findUnique({
      where: { id: parseInt(id) },
      include: {
        kelurahan: true, // ⬅️ tampilkan data kelurahan relasi
      },
    });

    if (!posyandu) {
      return NextResponse.json({ error: 'Data tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json(posyandu);
  } catch (error) {
    console.error('[GET Posyandu]', error);
    return NextResponse.json({ error: 'Gagal mengambil data posyandu.' }, { status: 500 });
  }
}


// PUT: Update data posyandu
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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

    // Validasi kosong
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

    // Convert longitude dan latitude ke float
    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(lon) || isNaN(lat)) {
      return NextResponse.json(
        { error: 'Longitude dan Latitude harus berupa angka.' },
        { status: 400 }
      );
    }

    // Proses update
    const updated = await prisma.posyandu.update({
      where: { id: parseInt(id) },
      data: {
        nama,
        alamat,
        wilayah,
        kelurahanId: parseInt(kelurahanId),
        penanggungJawab,
        noHp,
        akreditasi: akreditasi as any,
        longitude: lon,
        latitude: lat,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[PUT Posyandu]', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate data posyandu.' },
      { status: 500 }
    );
  }
}


// DELETE: Hapus posyandu berdasarkan ID
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const posyanduId = parseInt(id);

    // Cek apakah ada kader yang terhubung
    const jumlahKader = await prisma.kader.count({
      where: { posyanduId },
    });

    if (jumlahKader > 0) {
      return NextResponse.json(
        {
          error: 'Posyandu masih memiliki kader aktif. Silakan hapus kader terlebih dahulu sebelum menghapus data.',
        },
        { status: 409 } // HTTP 409 Conflict
      );
    }

    // Hapus jika tidak ada kader
    await prisma.posyandu.delete({
      where: { id: posyanduId },
    });

    return NextResponse.json({ message: 'Data berhasil dihapus.' });
  } catch (error) {
    console.error('[DELETE Posyandu]', error);
    return NextResponse.json(
      { error: 'Gagal menghapus data posyandu.' },
      { status: 500 }
    );
  }
}
