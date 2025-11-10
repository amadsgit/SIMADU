import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ========================================================
// GET: Ambil detail program kesehatan berdasarkan ID
// ========================================================
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const prokesId = parseInt(id, 10);

    const prokes = await prisma.programKesehatan.findUnique({
      where: { id: prokesId },
      include: { klaster: true },
    });

    if (!prokes) {
      return NextResponse.json({ error: 'Program kesehatan tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json(prokes);
  } catch (error) {
    console.error('[GET Program Kesehatan]', error);
    return NextResponse.json({ error: 'Gagal mengambil data program kesehatan.' }, { status: 500 });
  }
}

// ========================================================
// PUT: Update program kesehatan
// ========================================================
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const prokesId = parseInt(id, 10);

    const { nama, deskripsi, klasterId, roleId } = await req.json();

    if (!nama || !klasterId) {
      return NextResponse.json({ error: 'Nama dan klaster wajib diisi!' }, { status: 400 });
    }

    // Cek program kesehatan ada
    const existing = await prisma.programKesehatan.findUnique({ where: { id: prokesId } });
    if (!existing) {
      return NextResponse.json({ error: 'Program kesehatan tidak ditemukan.' }, { status: 404 });
    }

    // Cek duplikasi nama di klaster yang sama
    const duplicate = await prisma.programKesehatan.findFirst({
      where: {
        AND: [
          { id: { not: prokesId } },
          { nama },
          { klasterId },
        ],
      },
    });

    if (duplicate) {
      return NextResponse.json({ error: 'Nama program kesehatan sudah digunakan di klaster ini.' }, { status: 409 });
    }

    const updatedProkes = await prisma.programKesehatan.update({
      where: { id: prokesId },
      data: { nama, deskripsi, klasterId, roleId },
      include: { klaster: true },
    });

    return NextResponse.json({
      message: 'Program kesehatan berhasil diperbarui!',
      data: updatedProkes,
    });
  } catch (error) {
    console.error('[PUT Program Kesehatan]', error);
    return NextResponse.json({ error: 'Gagal memperbarui program kesehatan.' }, { status: 500 });
  }
}

// ========================================================
// DELETE: Hapus program kesehatan
// ========================================================
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const prokesId = parseInt(id, 10);

    const existing = await prisma.programKesehatan.findUnique({ where: { id: prokesId } });
    if (!existing) {
      return NextResponse.json({ error: 'Program kesehatan tidak ditemukan.' }, { status: 404 });
    }

    await prisma.programKesehatan.delete({ where: { id: prokesId } });

    return NextResponse.json({ message: 'Program kesehatan berhasil dihapus.' });
  } catch (error) {
    console.error('[DELETE Program Kesehatan]', error);
    return NextResponse.json({ error: 'Gagal menghapus program kesehatan.' }, { status: 500 });
  }
}
