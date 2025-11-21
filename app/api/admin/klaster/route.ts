import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// ==============================
// GET: Ambil semua data klaster
// ==============================
export async function GET() {
  try {
    const klasters = await prisma.klaster.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        programKesehatan: {
          select: { id: true, nama: true },
        },
      },
    });

    return NextResponse.json(klasters);
  } catch (error) {
    console.error('[GET klaster]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data klaster' },
      { status: 500 }
    );
  }
}

// ==============================
// POST: Tambah klaster baru
// ==============================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nama, deskripsi } = body;

    if (!nama) {
      return NextResponse.json(
        { error: 'Nama klaster wajib diisi!' },
        { status: 400 }
      );
    }

    // Cek apakah nama klaster sudah ada
    const existing = await prisma.klaster.findUnique({ where: { nama } });
    if (existing) {
      return NextResponse.json(
        { error: 'Nama klaster sudah terdaftar!' },
        { status: 400 }
      );
    }

    const newKlaster = await prisma.klaster.create({
      data: { nama, deskripsi },
    });

    return NextResponse.json({
      message: 'Klaster berhasil ditambahkan!',
      data: newKlaster,
    });
  } catch (error) {
    console.error('[POST klaster]', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan klaster' },
      { status: 500 }
    );
  }
}
