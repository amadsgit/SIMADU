import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Ambil semua balita yang punya koordinat untuk sebaran peta
    const balita = await prisma.balita.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        posyandu: {
          select: {
            id: true,
            nama: true,
            alamat: true,
            wilayah: true,
            kelurahan: {
              select: { id: true, nama: true },
            },
          },
        },
        kader: {
          select: {
            id: true,
            nama: true,
            noHp: true,
          },
        },
        // Ambil pemeriksaan terbaru
        pemeriksaanBalita: {
          orderBy: { tanggal: "desc" },
          take: 1,
          include: {
            kader: true,
          },
        },
        // Ambil status gizi terbaru
        statusGizi: {
          orderBy: { tanggal: "desc" },
          take: 1,
        },
      },
      orderBy: { id: "desc" },
    });

    const formatted = balita.map((b) => {
      const latestPemeriksaan = b.pemeriksaanBalita[0] || null;
      const latestStatusGizi = b.statusGizi[0] || null;

      return {
        id: b.id,
        nama: b.nama,
        tanggalLahir: b.tanggalLahir,
        jenisKelamin: b.jenisKelamin,
        alamat: b.alamat,
        latitude: b.latitude,
        longitude: b.longitude,

        posyandu: b.posyandu
          ? {
              id: b.posyandu.id,
              nama: b.posyandu.nama,
              alamat: b.posyandu.alamat,
              wilayah: b.posyandu.wilayah,
              kelurahan: b.posyandu.kelurahan,
            }
          : null,

        kader: b.kader
          ? {
              id: b.kader.id,
              nama: b.kader.nama,
              noHp: b.kader.noHp,
            }
          : null,

        pemeriksaanTerbaru: latestPemeriksaan
          ? {
              id: latestPemeriksaan.id,
              tanggal: latestPemeriksaan.tanggal,
              beratBadan: latestPemeriksaan.beratBadan,
              tinggiBadan: latestPemeriksaan.tinggiBadan,
              lingkarKepala: latestPemeriksaan.lingkarKepala,
              imunisasi: latestPemeriksaan.imunisasi,
              vitamin: latestPemeriksaan.vitamin,
              jenisVitamin: latestPemeriksaan.jenisVitamin,
              pmt: latestPemeriksaan.pmt,
              jenisPmt: latestPemeriksaan.jenisPmt,
              keluhan: latestPemeriksaan.keluhan,
              tindakan: latestPemeriksaan.tindakan,
              catatan: latestPemeriksaan.catatan,
              kaderPemeriksa: latestPemeriksaan.kader
                ? {
                    id: latestPemeriksaan.kader.id,
                    nama: latestPemeriksaan.kader.nama,
                  }
                : null,
            }
          : null,

        statusGiziTerbaru: latestStatusGizi
          ? {
              id: latestStatusGizi.id,
              tanggal: latestStatusGizi.tanggal,
              kategoriGizi: latestStatusGizi.kategoriGizi, // Gizi Baik, Kurang, Buruk, Risiko Lebih
              statusStunting: latestStatusGizi.statusStunting, // Normal, Pendek, Sangat Pendek
              beratBadan: latestStatusGizi.beratBadan,
              tinggiBadan: latestStatusGizi.tinggiBadan,
              zScoreBBU: latestStatusGizi.zScoreBBU,
              zScoreTBU: latestStatusGizi.zScoreTBU,
              zScoreBBTB: latestStatusGizi.zScoreBBTB,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Berhasil mengambil data sebaran balita",
      total: formatted.length,
      data: formatted,
    });
  } catch (error: any) {
    console.error("API ERROR /api/maps/sebaranBalita:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data sebaran balita",
        error: error?.message,
      },
      { status: 500 }
    );
  }
}
