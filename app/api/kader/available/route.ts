import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Ambil hanya kader yang belum punya user
    const kader = await prisma.kader.findMany({
      where: {
        userId: null, // hanya kader tanpa akun user
      },
      include: {
        posyandu: {
          include: {
            kelurahan: {
              select: { id: true, nama: true },
            },
          },
        },
      },
      orderBy: { nama: 'asc' },
    });

    return NextResponse.json(kader);
  } catch (error: any) {
    console.error('[GET available kader]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kader yang tersedia', detail: error.message },
      { status: 500 }
    );
  }
}
