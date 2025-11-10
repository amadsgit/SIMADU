import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// ==============================
// GET: Ambil semua data program kesehatan
// ==============================
export async function GET() {
  try {
    const prokes = await prisma.programKesehatan.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        klaster: true, // include data klaster
      },
    });

    return NextResponse.json(prokes);
  } catch (error) {
    console.error('[GET Program Kesehatan]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data program kesehatan' },
      { status: 500 }
    );
  }
}

// ==============================
// POST: Tambah program kesehatan baru
// ==============================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nama, deskripsi, klasterId, roleId } = body;

    if (!nama || !klasterId) {
      return NextResponse.json(
        { error: 'Nama dan klaster wajib diisi!' },
        { status: 400 }
      );
    }

    // Cek duplikasi nama program kesehatan di klaster yang sama
    const existing = await prisma.programKesehatan.findFirst({
      where: { nama, klasterId },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Nama program kesehatan sudah terdaftar di klaster ini!' },
        { status: 400 }
      );
    }

    const newProkes = await prisma.programKesehatan.create({
      data: { nama, deskripsi, klasterId, roleId },
      include: { klaster: true },
    });

    return NextResponse.json({
      message: 'Program kesehatan berhasil ditambahkan!',
      data: newProkes,
    });
  } catch (error) {
    console.error('[POST Program Kesehatan]', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan program kesehatan' },
      { status: 500 }
    );
  }
}
