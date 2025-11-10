import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ==================================================
// GET: Cek apakah nama Posyandu sudah ada (realtime)
// ==================================================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const nama = searchParams.get('nama');

    if (!nama) {
      return NextResponse.json(
        { error: 'Parameter nama tidak ditemukan' },
        { status: 400 }
      );
    }

    const posyandu = await prisma.posyandu.findFirst({
      where: {
        nama: {
          equals: nama,
          mode: 'insensitive', // abaikan huruf besar/kecil
        },
      },
    });

    return NextResponse.json({ exists: !!posyandu });
  } catch (error) {
    console.error('[CHECK NAMA POSYANDU ERROR]', error);
    return NextResponse.json(
      { error: 'Gagal memeriksa data nama posyandu' },
      { status: 500 }
    );
  }
}
