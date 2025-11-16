import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  try {
    // ============================
    // CEK LOGIN
    // ============================
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ============================
    // AMBIL DATA KADER + POSYANDU
    // ============================
    const kader = await prisma.kader.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        nama: true,
        posyanduId: true,
        posyandu: {
          select: {
            id: true,
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

    // ============================
    // AMBIL DATA BALITA + STATUS GIZI + PEMERIKSAAN
    // ============================
    const balitaList = await prisma.balita.findMany({
      where: { posyanduId: kader.posyanduId },
      include: {
        statusGizi: {
          orderBy: { tanggal: "desc" },
        },
        pemeriksaanBalita: {
          orderBy: { tanggal: "desc" },
        },
      },
      orderBy: { nama: "asc" },
    });

    // ============================
    // FORMAT DATA
    // ============================
    const formatted = balitaList.map((b) => {
      const latestStatus = b.statusGizi[0] || null;

      return {
        id: b.id,
        nama: b.nama,
        nik: b.nik,
        noKK: b.noKK,
        jenisKelamin: b.jenisKelamin,
        tanggalLahir: b.tanggalLahir,
        // umurBulan: Math.floor(
        //   (new Date().getTime() - new Date(b.tanggalLahir).getTime()) /
        //     (1000 * 60 * 60 * 24 * 30.44)
        // ),
        alamat: b.alamat,

        // Status Gizi
        statusGiziTerakhir: latestStatus,
        riwayatStatusGizi: b.statusGizi,

        // Pemeriksaan Balita
        pemeriksaanTerakhir: b.pemeriksaanBalita[0] || null,
        riwayatPemeriksaan: b.pemeriksaanBalita,
      };
    });

    // ============================
    // REKAP GIZI
    // ============================
    const totalBalita = formatted.length;

    const risikoGiziLebih = formatted.filter(
      (x) => x.statusGiziTerakhir?.kategoriGizi === "Risiko Gizi Lebih"
    ).length;

    const giziBaik = formatted.filter(
      (x) => x.statusGiziTerakhir?.kategoriGizi === "Gizi Baik"
    ).length;

    const giziKurang = formatted.filter(
      (x) => x.statusGiziTerakhir?.kategoriGizi === "Gizi Kurang"
    ).length;

    const giziBuruk = formatted.filter(
      (x) => x.statusGiziTerakhir?.kategoriGizi === "Gizi Buruk"
    ).length;

    // Hitung berdasarkan statusStunting
    const stunting = formatted.filter((x) =>
      ["Pendek", "Sangat Pendek"].includes(
        x.statusGiziTerakhir?.statusStunting ?? ""
      )
    ).length;

    // Rata-rata zScore
    const avg = (arr: number[]) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

    const avgBBU = avg(
      formatted
        .map((x) => x.statusGiziTerakhir?.zScoreBBU)
        .filter((v) => v !== null && v !== undefined) as number[]
    );

    const avgTBU = avg(
      formatted
        .map((x) => x.statusGiziTerakhir?.zScoreTBU)
        .filter((v) => v !== null && v !== undefined) as number[]
    );

    const avgBBTB = avg(
      formatted
        .map((x) => x.statusGiziTerakhir?.zScoreBBTB)
        .filter((v) => v !== null && v !== undefined) as number[]
    );

    // ============================
    // RETURN RESPONSE
    // ============================
    return NextResponse.json({
      status: "success",
      posyandu: kader.posyandu?.nama,
      wilayah: kader.posyandu?.wilayah,
      kelurahan: kader.posyandu?.kelurahan?.nama,

      // Rekap Data
      totalBalita,
      risikoGiziLebih,
      giziBaik,
      giziKurang,
      giziBuruk,
      stunting,
      rataRataZScore: {
        bbu: avgBBU,
        tbu: avgTBU,
        bbtb: avgBBTB,
      },

      // Data Detail Balita
      data: formatted,
    });
  } catch (error: any) {
    console.error("[GET /api/kader/statusGiziBalita]", error);
    return NextResponse.json(
      { error: "Gagal mengambil data status gizi balita", detail: error.message },
      { status: 500 }
    );
  }
}
