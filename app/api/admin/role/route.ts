import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Fungsi bantu untuk membuat slug dari nama
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // hapus karakter spesial
    .replace(/\s+/g, '_')         // ganti spasi dengan _
    .replace(/_+/g, '_');         // hapus tanda _ ganda
}

export async function GET() {
  try {
    const role = await prisma.role.findMany({ include: { users: true } });
    return NextResponse.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json({ message: 'Gagal mengambil data role' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama } = body;

    if (!nama || typeof nama !== 'string') {
      return NextResponse.json({ message: 'Nama role tidak valid' }, { status: 400 });
    }

    const slug = generateSlug(nama);

    const existing = await prisma.role.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json({ message: 'Role dengan nama yang sama sudah ada' }, { status: 409 });
    }

    const newRole = await prisma.role.create({
      data: {
        nama,
        slug,
      },
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json({ message: 'Gagal menambah Role' }, { status: 500 });
  }
}
