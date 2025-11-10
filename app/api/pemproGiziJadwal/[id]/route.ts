import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ========================================================
// GET: Ambil detail kegiatan berdasarkan ID
// ========================================================
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: number }> }
) {
  try {
    const { id } = await context.params;

    const kegiatan = await prisma.kegiatan.findUnique({
      where: { id: Number(id) },
      include: {
        posyandu: {
          select: {
            id: true,
            nama: true,
            alamat: true,
            wilayah: true,
            kelurahan: { select: { id: true, nama: true } },
          },
        },
        programKesehatan: { select: { id: true, nama: true } },
      },
    });

    if (!kegiatan) {
      return NextResponse.json({ error: 'Kegiatan tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json(kegiatan);
  } catch (error) {
    console.error('[GET Kegiatan]', error);
    return NextResponse.json({ error: 'Gagal mengambil data kegiatan.' }, { status: 500 });
  }
}

// ========================================================
// PUT: Update data kegiatan berdasarkan ID
// ========================================================
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: number }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { nama, deskripsi, tanggalPelaksanaan, alamat, posyanduId } = body;

    if (!nama || !tanggalPelaksanaan || !alamat || !posyanduId) {
      return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 });
    }

    const existingKegiatan = await prisma.kegiatan.findUnique({ where: { id: Number(id) } });
    if (!existingKegiatan) {
      return NextResponse.json({ error: 'Kegiatan tidak ditemukan.' }, { status: 404 });
    }

    const updatedKegiatan = await prisma.kegiatan.update({
      where: { id: Number(id) },
      data: {
        nama,
        deskripsi,
        tanggalPelaksanaan: new Date(tanggalPelaksanaan),
        alamat,
        posyanduId: Number(posyanduId),
      },
      include: {
        posyandu: { select: { id: true, nama: true } },
        programKesehatan: { select: { id: true, nama: true } },
      },
    });

    return NextResponse.json({
      message: 'Data kegiatan berhasil diperbarui.',
      data: updatedKegiatan,
    });
  } catch (error) {
    console.error('[PUT Kegiatan]', error);
    return NextResponse.json({ error: 'Gagal mengupdate data kegiatan.' }, { status: 500 });
  }
}

// ========================================================
// DELETE: Hapus kegiatan berdasarkan ID
// ========================================================
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const kegiatan = await prisma.kegiatan.findUnique({ where: { id: Number(id) } });
    if (!kegiatan) {
      return NextResponse.json({ error: 'Kegiatan tidak ditemukan.' }, { status: 404 });
    }

    await prisma.kegiatan.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: 'Kegiatan berhasil dihapus.' });
  } catch (error) {
    console.error('[DELETE Kegiatan]', error);
    return NextResponse.json({ error: 'Gagal menghapus kegiatan.' }, { status: 500 });
  }
}
