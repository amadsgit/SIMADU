import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ========================================================
// GET: Ambil detail klaster berdasarkan ID
// ========================================================
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const klasterId = parseInt(id, 10);

    const klaster = await prisma.klaster.findUnique({
      where: { id: klasterId },
      include: {
        programKesehatan: { select: { id: true, nama: true } },
      },
    });

    if (!klaster) {
      return NextResponse.json({ error: 'Klaster tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json(klaster);
  } catch (error) {
    console.error('[GET Klaster]', error);
    return NextResponse.json({ error: 'Gagal mengambil data klaster.' }, { status: 500 });
  }
}

// ========================================================
// PUT: Update klaster
// ========================================================
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const klasterId = parseInt(id, 10);

    const { nama, deskripsi } = await req.json();

    if (!nama) {
      return NextResponse.json({ error: 'Nama klaster wajib diisi!' }, { status: 400 });
    }

    // Cek klaster ada
    const existing = await prisma.klaster.findUnique({ where: { id: klasterId } });
    if (!existing) {
      return NextResponse.json({ error: 'Klaster tidak ditemukan.' }, { status: 404 });
    }

    // Cek duplikasi nama selain dirinya sendiri
    const duplicate = await prisma.klaster.findFirst({
      where: {
        AND: [
          { id: { not: klasterId } },
          { nama },
        ],
      },
    });

    if (duplicate) {
      return NextResponse.json({ error: 'Nama klaster sudah digunakan oleh klaster lain.' }, { status: 409 });
    }

    const updatedKlaster = await prisma.klaster.update({
      where: { id: klasterId },
      data: { nama, deskripsi },
    });

    return NextResponse.json({
      message: 'Klaster berhasil diperbarui!',
      data: updatedKlaster,
    });
  } catch (error) {
    console.error('[PUT Klaster]', error);
    return NextResponse.json({ error: 'Gagal memperbarui klaster.' }, { status: 500 });
  }
}

// ========================================================
// DELETE: Hapus klaster
// ========================================================
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const klasterId = parseInt(id, 10);

    const existing = await prisma.klaster.findUnique({ where: { id: klasterId } });
    if (!existing) {
      return NextResponse.json({ error: 'Klaster tidak ditemukan.' }, { status: 404 });
    }

    await prisma.klaster.delete({ where: { id: klasterId } });

    return NextResponse.json({ message: 'Klaster berhasil dihapus.' });
  } catch (error) {
    console.error('[DELETE Klaster]', error);
    return NextResponse.json({ error: 'Gagal menghapus klaster.' }, { status: 500 });
  }
}
