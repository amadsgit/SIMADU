import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET() {
  try {
    const kelurahan = await prisma.kelurahan.findMany({
      select: {
        id: true,
        nama: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(kelurahan);
  } catch (error) {
    console.error('Error fetching kelurahan:', error);
    return NextResponse.json({ message: 'Gagal mengambil data kelurahan/desa' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama } = body;

    if (!nama || typeof nama !== 'string') {
      return NextResponse.json({ message: 'Nama kelurahan/desa tidak valid' }, { status: 400 });
    }

    const existing = await prisma.kelurahan.findUnique({
      where: { nama },
    });

    if (existing) {
      return NextResponse.json({ message: 'Kelurahan/Desa sudah ada' }, { status: 409 });
    }

    const newKelurahan = await prisma.kelurahan.create({
      data: { nama },
    });

    return NextResponse.json(newKelurahan, { status: 201 });
  } catch (error) {
    console.error('Error creating kelurahan:', error);
    return NextResponse.json({ message: 'Gagal menambah kelurahan/desa' }, { status: 500 });
  }
}
