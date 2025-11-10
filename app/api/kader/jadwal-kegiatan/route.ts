import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth-options";

export async function GET() {
  try {
    // Ambil session user login
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil data kader berdasarkan userId
    const kader = await prisma.kader.findUnique({
      where: { userId: session.user.id },
      select: { posyanduId: true },
    });

    if (!kader) {
      return NextResponse.json({ error: 'Data kader tidak ditemukan' }, { status: 404 });
    }

    // Ambil kegiatan berdasarkan posyandu kader login
    const kegiatan = await prisma.kegiatan.findMany({
      where: { posyanduId: kader.posyanduId },
      include: {
        posyandu: {
          select: {
            id: true,
            nama: true,
            alamat: true,
            wilayah: true,
            kelurahan: {
              select: { id: true, nama: true },
            },
          },
        },
        programKesehatan: {
          select: { id: true, nama: true },
        },
      },
      orderBy: { tanggalPelaksanaan: 'asc' },
    });

    return NextResponse.json(kegiatan);
  } catch (error: any) {
    console.error('[GET jadwal-posyandu]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kegiatan kader', detail: error.message },
      { status: 500 }
    );
  }
  
}
