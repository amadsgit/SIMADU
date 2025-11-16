import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    // ==========================================================
    // CEK LOGIN
    // ==========================================================
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ==========================================================
    // AMBIL DATA KADER + POSYANDU
    // ==========================================================
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

    const kaderId = kader.id;
    const posyanduId = kader.posyanduId;

    // ==========================================================
    // HITUNG STATISTIK
    // ==========================================================
    const [
      totalPemeriksaanBalita,
      totalPemeriksaanIbuHamil,
      totalPelaksanaanKegiatan,
      totalBelumMulai,
      totalBerjalan,
      totalSelesai,
      totalBalita,
      totalStunting,
      totalStatusGizi
    ] = await Promise.all([
      // 1. Pemeriksaan Balita
      prisma.pemeriksaanBalita.count({ where: { kaderId } }),
      // 2. Pemeriksaan Ibu Hamil
      prisma.pemeriksaanIbuHamil.count({ where: { kaderId } }),
      // 3. Pelaksanaan Kegiatan
      prisma.pelaksanaanKegiatan.count({ where: { kaderId } }),
      prisma.pelaksanaanKegiatan.count({ where: { kaderId, status: "belum_mulai" } }),
      prisma.pelaksanaanKegiatan.count({ where: { kaderId, status: "berjalan" } }),
      prisma.pelaksanaanKegiatan.count({ where: { kaderId, status: "selesai" } }),
      // 4. Total Balita di Posyandu
      prisma.balita.count({ where: { posyanduId } }),
      // 5. Total Stunting ("Pendek" atau "Sangat Pendek")
      prisma.statusGiziBalita.count({
        where: {
          statusStunting: { in: ["Pendek", "Sangat Pendek"] },
          balita: { posyanduId }
        }
      }),
      // 6. Total status gizi tercatat
      prisma.statusGiziBalita.count({
        where: { balita: { posyanduId } }
      })
    ]);

    // ==========================================================
    // RETURN RESPONSE
    // ==========================================================
    return NextResponse.json({
      kader: {
        id: kader.id,
        nama: kader.nama,
      },
      posyandu: {
        id: kader.posyandu?.id,
        nama: kader.posyandu?.nama,
        wilayah: kader.posyandu?.wilayah,
        kelurahan: kader.posyandu?.kelurahan?.nama,
      },
      dashboard: {
        totalBalita,
        totalPemeriksaanBalita,
        totalPemeriksaanIbuHamil,
        totalPelaksanaanKegiatan,
        totalBelumMulai,
        totalBerjalan,
        totalSelesai,
        totalStunting,
        totalStatusGizi,
      }
    });

  } catch (error: any) {
    console.error("Error dashboard kader:", error);
    return NextResponse.json(
      { error: "Server error", detail: error.message },
      { status: 500 }
    );
  }
}
