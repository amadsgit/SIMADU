import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  try {
    // ==== CEK LOGIN ====
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ==== AMBIL KADER ====
    const kader = await prisma.kader.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        nama: true,
        posyanduId: true,
        posyandu: {
          select: {
            nama: true,
            wilayah: true,
            kelurahan: { select: { nama: true } },
          },
        },
      },
    });

    if (!kader) {
      return NextResponse.json(
        { error: "Kader tidak ditemukan" },
        { status: 404 }
      );
    }

    // ==== AMBIL IBU HAMIL BERDASARKAN POSYANDU ====
    const ibuHamil = await prisma.ibuHamil.findMany({
      where: { posyanduId: kader.posyanduId },
      include: {
        pemeriksaanKehamilan: {
          orderBy: { tanggal: "desc" },
          take: 1, // hanya pemeriksaan terakhir
        },
      },
      orderBy: { nama: "asc" },
    });

    // ==== FORMAT DATA ====
    const formatted = ibuHamil.map((item) => ({
      id: item.id,
      nama: item.nama,
      nik: item.nik,
      noKK: item.noKK,
      tanggalHPHT: item.tanggalHPHT,
      tanggalHPL: item.tanggalHPL,
      gravida: item.gravida,
      para: item.para,
      abortus: item.abortus,
      alamat: item.alamat,
      pemeriksaanTerakhir: item.pemeriksaanKehamilan[0] || null,
    }));

    // ==== REKAP DATA ====
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const hplBulanIni = formatted.filter((x) => {
      if (!x.tanggalHPL) return false;
      const hpl = new Date(x.tanggalHPL);
      return (
        hpl.getMonth() + 1 === currentMonth &&
        hpl.getFullYear() === currentYear
      );
    }).length;

    const trimester3 = formatted.filter((x) => {
      if (!x.tanggalHPHT) return false;
      const hpht = new Date(x.tanggalHPHT);
      const diffWeeks = Math.floor(
        (now.getTime() - hpht.getTime()) /
          (1000 * 60 * 60 * 24 * 7)
      );
      return diffWeeks >= 28; // trimester 3
    }).length;

    return NextResponse.json({
      status: "success",
      posyandu: kader.posyandu?.nama,
      wilayah: kader.posyandu?.wilayah,
      kelurahan: kader.posyandu.kelurahan?.nama,
      totalIbuHamil: formatted.length,
      hplBulanIni,
      trimester3,
      data: formatted,
    });
  } catch (error: any) {
    console.error("[GET /api/kader/pemantauanKehamilan]", error);
    return NextResponse.json(
      { error: "Gagal mengambil data ibu hamil", detail: error.message },
      { status: 500 }
    );
  }
}
