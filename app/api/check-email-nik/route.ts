import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const nik = searchParams.get('nik');

    let user = null;

    // Prioritas: jika ada email cek email, jika ada NIK cek NIK
    if (email) {
      user = await prisma.user.findUnique({ where: { email } });
      return NextResponse.json({ exists: !!user, field: 'email' });
    }

    if (nik) {
      user = await prisma.user.findUnique({ where: { nik } });
      return NextResponse.json({ exists: !!user, field: 'nik' });
    }

    return NextResponse.json({ error: 'Parameter tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('[CHECK EMAIL/NIK ERROR]', error);
    return NextResponse.json({ error: 'Gagal memeriksa data' }, { status: 500 });
  }
}
