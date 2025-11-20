import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Ambil semua data ibu hamil yang punya koordinat
    const ibuHamil = await prisma.ibuHamil.findMany({
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
        // Pemeriksaan kehamilan terbaru
        pemeriksaanKehamilan: {
          orderBy: { tanggal: "desc" },
          take: 1,
          include: {
            kader: true,
            kegiatan: true,
            pelaksanaanKegiatan: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    const formatted = ibuHamil.map((b) => {
      const latestPemeriksaan = b.pemeriksaanKehamilan[0] || null;

      return {
        id: b.id,
        nama: b.nama,
        nik: b.nik,
        noKK: b.noKK,
        tanggalLahir: b.tanggalLahir,
        umurKehamilanAwal: b.umurKehamilanAwal,
        tanggalHPHT: b.tanggalHPHT,
        tanggalHPL: b.tanggalHPL,
        gravida: b.gravida,
        para: b.para,
        abortus: b.abortus,

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
              usiaKehamilan: latestPemeriksaan.usiaKehamilan,
              beratBadan: latestPemeriksaan.beratBadan,
              tekananDarah: latestPemeriksaan.tekananDarah,
              tinggiFundus: latestPemeriksaan.tinggiFundus,
              detakJantungJanin: latestPemeriksaan.detakJantungJanin,
              pemberianFe: latestPemeriksaan.pemberianFe,
              pmt: latestPemeriksaan.pmt,
              jenisPmt: latestPemeriksaan.jenisPmt,
              keluhan: latestPemeriksaan.keluhan,
              tindakan: latestPemeriksaan.tindakan,
              konseling: latestPemeriksaan.konseling,

              kaderPemeriksa: latestPemeriksaan.kader
                ? {
                    id: latestPemeriksaan.kader.id,
                    nama: latestPemeriksaan.kader.nama,
                  }
                : null,

              kegiatan: latestPemeriksaan.kegiatan
                ? {
                    id: latestPemeriksaan.kegiatan.id,
                    nama: latestPemeriksaan.kegiatan.nama,
                  }
                : null,

            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Berhasil mengambil data sebaran ibu hamil",
      total: formatted.length,
      data: formatted,
    });
  } catch (error: any) {
    console.error("API ERROR /api/maps/sebaranIbuHamil:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data sebaran ibu hamil",
        error: error?.message,
      },
      { status: 500 }
    );
  }
}
