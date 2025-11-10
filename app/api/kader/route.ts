
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET() {
  try {
    const kader = await prisma.kader.findMany({
      include: {
        posyandu: {
          include: {
            kelurahan: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
      },
      orderBy: { nama: 'asc' },
    });

    return NextResponse.json(kader);
  } catch (error: any) {
    console.error('[GET kader]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kader', detail: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const kader = await prisma.kader.create({ data });
    return NextResponse.json(kader, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/kader error:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan kader', detail: error?.message },
      { status: 400 }
    );
  }
}

