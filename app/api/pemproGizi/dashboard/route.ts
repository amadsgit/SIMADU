import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ========================================================
// GET: Dashboard Kegiatan Program Gizi
// ========================================================
export async function GET() {
  try {
    const kegiatan = await prisma.kegiatan.findMany({
      where: {
        programKesehatan: {
          nama: {
            contains: "Program Gizi",
            mode: "insensitive",
          },
        },
      },
      include: {
        pelaksanaanKegiatan: true,
      },
      orderBy: { tanggalPelaksanaan: "desc" },
    });

    // Hitung status pelaksanaan
    let total = kegiatan.length;
    let belumMulai = 0;
    let berjalan = 0;
    let selesai = 0;

    for (const k of kegiatan) {
      for (const p of k.pelaksanaanKegiatan) {
        const status = (p.status ?? "").toLowerCase().trim();

        if (status === "belum mulai") belumMulai++;
        else if (status === "berjalan") berjalan++;
        else if (status === "selesai" || status === "completed") selesai++;
        else {
          const hasStart = !!p.tanggalMulai;
          const hasEnd = !!p.tanggalSelesai;

          if (hasStart && !hasEnd) berjalan++;
          else if (hasEnd) selesai++;
          else belumMulai++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalKegiatan: total,
        kegiatanBelumMulai: belumMulai,
        kegiatanBerjalan: berjalan,
        kegiatanSelesai: selesai,
      },
    });
  } catch (error) {
    console.error("[Dashboard Gizi]", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}
