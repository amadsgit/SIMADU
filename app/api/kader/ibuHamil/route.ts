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
// POST: tambah ibu hamil baru (lengkap + auto hitung HPL & usia kehamilan)
// =====================================================
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cari kader login
    const kader = await prisma.kader.findUnique({
      where: { userId: session.user.id },
      select: { id: true, posyanduId: true },
    });

    if (!kader) {
      return NextResponse.json(
        { error: "Data kader tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const {
      nama,
      nik,
      noKK,
      tanggalLahir,
      BBSH,
      TBSH,
      liLA,
      tanggalHPHT,
      gravida,
      para,
      abortus,
      golonganDarah,
      kepemilikanJKN,
      noJKN,
      kepemilikanBukuKIA,
      namaSuami,
      HPSuami,
      alamat,
      RT,
      RW,
      longitude,
      latitude,
    } = body;

    // ================================
    // Validasi field wajib
    // ================================
    if (!nama || !nik || !tanggalLahir || !alamat || !namaSuami || !HPSuami) {
      return NextResponse.json(
        {
          error:
            "Field wajib: nama, nik, tanggalLahir, alamat, namaSuami, HPSuami",
        },
        { status: 400 }
      );
    }

    // Pastikan NIK unik
    const existing = await prisma.ibuHamil.findUnique({ where: { nik } });
    if (existing) {
      return NextResponse.json(
        { error: "NIK ibu hamil sudah terdaftar!" },
        { status: 400 }
      );
    }

    // ========== Convert angka ==========
    const toFloat = (val: any) =>
      val !== undefined && val !== null && val !== "" ? parseFloat(val) : null;

    const toInt = (val: any) =>
      val !== undefined && val !== null && val !== "" ? parseInt(val) : null;

    const lon = longitude ? parseFloat(longitude) : null;
    const lat = latitude ? parseFloat(latitude) : null;

    // ================================
    // Kalkulasi Otomatis HPHT-> HPL & umur kehamilan
    // ================================
    let calculatedHPL: Date | null = null;
    let umurAwal: number | null = null;

    if (tanggalHPHT) {
      const hpht = new Date(tanggalHPHT);

      const hpl = new Date(hpht);
      hpl.setDate(hpht.getDate() + 7);
      hpl.setMonth(hpht.getMonth() + 9);
      calculatedHPL = hpl;

      const now = new Date();
      umurAwal = Math.floor(
        (now.getTime() - hpht.getTime()) / (1000 * 60 * 60 * 24 * 7)
      );
      if (umurAwal < 0) umurAwal = 0;
    }

    const posyanduId = kader.posyanduId;

    // ================================
    // Hitung ulang IMT & Status KEK di server
    // ================================
    let calculatedIMT: number | null = null;
    let calculatedKEK: string = "Tidak KEK";

    if (BBSH && TBSH) {
      const bb = parseFloat(BBSH);
      const tbMeter = parseFloat(TBSH) / 100;

      if (bb > 0 && tbMeter > 0) {
        calculatedIMT = parseFloat((bb / (tbMeter * tbMeter)).toFixed(2));
      }
    }

    if (liLA) {
      const lilaVal = parseFloat(liLA);
      calculatedKEK = lilaVal < 23.5 ? "KEK" : "Tidak KEK";
    }

    // ================================
    // Insert ke database
    // ================================
    const newIbuHamil = await prisma.ibuHamil.create({
      data: {
        nama,
        nik,
        noKK: noKK || null,
        tanggalLahir: new Date(tanggalLahir),

        // Data kesehatan
        BBSH: toFloat(BBSH) ?? 0,
        TBSH: toFloat(TBSH) ?? 0,
        liLA: toFloat(liLA) ?? 0,
        IMTSH: calculatedIMT ?? 0,   // pakai hasil hitungan server
        StatusGiziKEK: calculatedKEK, // akai hasil final server

        // Kehamilan
        tanggalHPHT: tanggalHPHT ? new Date(tanggalHPHT) : new Date(),
        umurKehamilanAwal: umurAwal ?? 0,
        tanggalHPL: calculatedHPL ?? new Date(),

        gravida: toInt(gravida),
        para: toInt(para),
        abortus: toInt(abortus),

        golonganDarah: golonganDarah || "Belum_diperiksa",
        kepemilikanJKN: kepemilikanJKN || "Belum_punya",
        noJKN: noJKN || null,

        kepemilikanBukuKIA: kepemilikanBukuKIA || "Ya",
        namaSuami,
        HPSuami,

        alamat,
        RT: RT || null,
        RW: RW || null,

        longitude: lon,
        latitude: lat,

        posyanduId: posyanduId as number,
        kaderId: kader.id,
      },

      include: {
        posyandu: { select: { id: true, nama: true, wilayah: true } },
        kader: { select: { id: true, nama: true } },
      },
    });

    return NextResponse.json(
      {
        message: "Data ibu hamil berhasil ditambahkan",
        data: newIbuHamil,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/kader/ibuhamil] ERROR:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan data ibu hamil", detail: error.message },
      { status: 500 }
    );
  }
}
