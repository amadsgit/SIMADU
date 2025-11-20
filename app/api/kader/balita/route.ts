import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth-options";
import { differenceInYears, differenceInMonths } from "date-fns";

function hitungUmur(tanggalLahir: Date) {
  const now = new Date();
  const years = differenceInYears(now, tanggalLahir);
  const months = differenceInMonths(now, tanggalLahir) % 12;
  return `${years} thn ${months} bln`;
}

// =====================================================
// GET: hanya balita yang terkait dengan kader login
// =====================================================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // cari kader berdasarkan userId (user.id di session adalah string)
    const kader = await prisma.kader.findUnique({
      where: { userId: session.user.id },
      select: { id: true, posyanduId: true },
    });

    if (!kader) {
      return NextResponse.json({ error: 'Data kader tidak ditemukan' }, { status: 404 });
    }

    // ambil balita terkait kader
    const balitas = await prisma.balita.findMany({
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

    // map untuk menambahkan field umur (string)
    const result = balitas.map((b) => {
      const tanggal = b.tanggalLahir ? new Date(b.tanggalLahir) : null;
      return {
        ...b,
        umur: tanggal ? hitungUmur(tanggal) : null,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[GET /api/kader/balita]', error);
    return NextResponse.json({ error: 'Gagal mengambil data balita', detail: error?.message ?? String(error) }, { status: 500 });
  }
}


// =====================================================
// POST: tambah balita baru, otomatis relasi ke kader login
// =====================================================
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      jenisKelamin,
      namaAyah,
      namaIbu,
      alamat,
      longitude,
      latitude,
      beratLahir,
      panjangLahir,
    } = body;

    // validasi minimal
    if (!nama || !noKK || !tanggalLahir || !jenisKelamin || !alamat) {
      return NextResponse.json(
        { error: 'Field wajib: nama, noKK, tanggalLahir, jenisKelamin, alamat' },
        { status: 400 }
      );
    }

    // cek NIK unik jika ada
    if (nik) {
      const existing = await prisma.balita.findUnique({ where: { nik } });
      if (existing) {
        return NextResponse.json({ error: 'NIK balita sudah terdaftar!' }, { status: 400 });
      }
    }

    // Convert longitude/latitude (boleh null & gunakan parseFloat)
    const lon =
      longitude !== undefined && longitude !== null && longitude !== ''
        ? parseFloat(longitude)
        : null;

    const lat =
      latitude !== undefined && latitude !== null && latitude !== ''
        ? parseFloat(latitude)
        : null;

    // gunakan posyanduId dari kader
    const posyanduId = kader.posyanduId;

    const newBalita = await prisma.balita.create({
      data: {
        nama,
        nik: nik || null,
        noKK,
        tanggalLahir: new Date(tanggalLahir),
        jenisKelamin,
        namaAyah: namaAyah || null,
        namaIbu: namaIbu || null,
        alamat,
        longitude: lon,
        latitude: lat,
        beratLahir:
          typeof beratLahir !== 'undefined' && beratLahir !== null
            ? Number(beratLahir)
            : null,
        panjangLahir:
          typeof panjangLahir !== 'undefined' && panjangLahir !== null
            ? Number(panjangLahir)
            : null,
        posyanduId: posyanduId as number,
        kaderId: kader.id,
      },
      include: {
        posyandu: { select: { id: true, nama: true, wilayah: true } },
        kader: { select: { id: true, nama: true } },
      },
    });

    return NextResponse.json(
      { message: 'Balita berhasil ditambahkan', data: newBalita },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/kader/balita]', error);
    return NextResponse.json({ error: 'Gagal menambahkan balita', detail: error.message }, { status: 500 });
  }
}
