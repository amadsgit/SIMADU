import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ambil data kader login lengkap dengan posyandu & kelurahan 
    const kader = await prisma.kader.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        nama: true,
        posyandu: {
          select: {
            id: true,
            nama: true,
            wilayah: true,
            alamat: true,
            kelurahan: {
              select: { id: true, nama: true },
            },
          },
        },
      },
    });

    if (!kader) {
      return NextResponse.json({ error: 'Data kader tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(kader);
  } catch (error: any) {
    console.error('[GET /api/session-kader]', error);
    return NextResponse.json({ error: 'Gagal mengambil data kader login' }, { status: 500 });
  }
}
