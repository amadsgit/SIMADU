import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ibuHamilId = searchParams.get("ibuHamilId");

    if (!ibuHamilId) {
      return NextResponse.json(
        { error: "ibuHamilId wajib dikirim" },
        { status: 400 }
      );
    }

    const numericId = Number(ibuHamilId);
    if (Number.isNaN(numericId)) {
      return NextResponse.json(
        { error: "ID ibuHamil tidak valid" },
        { status: 400 }
      );
    }

    const ibu = await prisma.ibuHamil.findUnique({
      where: { id: numericId },
      select: { tanggalHPHT: true },
    });

    if (!ibu || !ibu.tanggalHPHT) {
      return NextResponse.json(
        { error: "Tanggal HPHT belum diisi untuk ibu hamil ini" },
        { status: 404 }
      );
    }

    const hpht = new Date(ibu.tanggalHPHT);
    const now = new Date();

    const hpl = new Date(hpht);
    hpl.setDate(hpht.getDate() + 7);
    hpl.setMonth(hpht.getMonth() + 9);

    const diffMs = now.getTime() - hpht.getTime();
    let usiaKehamilan = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
    if (usiaKehamilan < 0) usiaKehamilan = 0;

    return NextResponse.json({
      tanggalHPHT: hpht.toISOString().split("T")[0],
      tanggalHPL: hpl.toISOString().split("T")[0],
      usiaKehamilan,
    });
  } catch (error) {
    console.error("Error menghitung usia kehamilan:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
