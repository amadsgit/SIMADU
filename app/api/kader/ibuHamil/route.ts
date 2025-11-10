import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth-options";

// =====================================================
// GET: hanya ibu hamil yang terkait dengan kader login
// =====================================================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cari kader berdasarkan user login
    const kader = await prisma.kader.findUnique({
      where: { userId: session.user.id },
      select: { id: true, posyanduId: true },
    });

    if (!kader) {
      return NextResponse.json({ error: 'Data kader tidak ditemukan' }, { status: 404 });
    }

    // Ambil hanya data IbuHamil yang terkait dengan kader login
    const ibuHamilList = await prisma.ibuHamil.findMany({
      where: { kaderId: kader.id },
      orderBy: { createdAt: 'desc' },
      include: {
        posyandu: {
          select: {
            id: true,
            nama: true,
            wilayah: true,
            kelurahan: { select: { id: true, nama: true } },
          },
        },
        kader: { select: { id: true, nama: true } },
      },
    });

    return NextResponse.json(ibuHamilList);
  } catch (error: any) {
    console.error('[GET /api/kader/ibuhamil]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data ibu hamil', detail: error.message },
      { status: 500 }
    );
  }
}

// =====================================================
// POST: tambah ibu hamil baru, auto hitung HPL & usia kehamilan
// =====================================================
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cari kader login
    const kader = await prisma.kader.findUnique({
      where: { userId: session.user.id },
      select: { id: true, posyanduId: true },
    });

    if (!kader) {
      return NextResponse.json({ error: 'Data kader tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const {
      nama,
      nik,
      noKK,
      tanggalLahir,
      tanggalHPHT,
      gravida,
      para,
      abortus,
      alamat,
    } = body;

    // Validasi field wajib
    if (!nama || !nik || !noKK || !tanggalLahir || !alamat) {
      return NextResponse.json(
        { error: 'Field wajib: nama, nik, noKK, tanggalLahir, alamat' },
        { status: 400 }
      );
    }

    // Pastikan NIK unik
    const existing = await prisma.ibuHamil.findUnique({ where: { nik } });
    if (existing) {
      return NextResponse.json({ error: 'NIK ibu hamil sudah terdaftar!' }, { status: 400 });
    }

    // ====== Kalkulasi Otomatis ======
    let calculatedHPL: Date | null = null;
    let umurKehamilanAwal: number | null = null;

    if (tanggalHPHT) {
      const hpht = new Date(tanggalHPHT);

      // Rumus Naegele: HPL = HPHT + 7 hari + 9 bulan
      const hpl = new Date(hpht);
      hpl.setDate(hpht.getDate() + 7);
      hpl.setMonth(hpht.getMonth() + 9);
      calculatedHPL = hpl;

      // Hitung usia kehamilan (minggu)
      const now = new Date();
      const diffMs = now.getTime() - hpht.getTime();
      umurKehamilanAwal = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7)); // konversi ke minggu
      if (umurKehamilanAwal < 0) umurKehamilanAwal = 0; // jika HPHT di masa depan
    }

    const posyanduId = kader.posyanduId;

    // Simpan ke database
    const newIbuHamil = await prisma.ibuHamil.create({
      data: {
        nama,
        nik,
        noKK,
        tanggalLahir: new Date(tanggalLahir),
        umurKehamilanAwal,
        tanggalHPHT: tanggalHPHT ? new Date(tanggalHPHT) : null,
        tanggalHPL: calculatedHPL,
        gravida: gravida ? Number(gravida) : null,
        para: para ? Number(para) : null,
        abortus: abortus ? Number(abortus) : null,
        alamat,
        posyanduId: posyanduId as number,
        kaderId: kader.id,
      },
      include: {
        posyandu: { select: { id: true, nama: true, wilayah: true } },
        kader: { select: { id: true, nama: true } },
      },
    });

    return NextResponse.json(
      { message: 'Data ibu hamil berhasil ditambahkan', data: newIbuHamil },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/kader/ibuhamil]', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan data ibu hamil', detail: error.message },
      { status: 500 }
    );
  }
}
