import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Hitung total balita & ibu hamil
    const totalBalita = await prisma.balita.count();
    const totalIbuHamil = await prisma.ibuHamil.count();

    // Ambil semua status gizi terbaru balita
    const statusGizi = await prisma.statusGiziBalita.findMany({
      select: {
        kategoriGizi: true,   // Gizi Baik, Kurang, Buruk, Risiko Gizi Lebih
        statusStunting: true, // Normal, Pendek, Sangat Pendek
      },
    });

    // Normalisasi helper
    const norm = (v: any) =>
      String(v ?? "")
        .replace(/[_-]/g, " ")
        .trim()
        .toLowerCase();

    // Hitung kategori gizi
    const giziLebih = statusGizi.filter(s => norm(s.kategoriGizi) === "risiko gizi lebih").length;
    const giziBaik = statusGizi.filter(s => norm(s.kategoriGizi) === "gizi baik").length;
    const giziKurang = statusGizi.filter(s => norm(s.kategoriGizi) === "gizi kurang").length;
    const giziBuruk = statusGizi.filter(s => norm(s.kategoriGizi) === "gizi buruk").length;

    // Hitung status stunting
    const normal = statusGizi.filter(s => norm(s.statusStunting) === "normal").length;
    const pendek = statusGizi.filter(s => norm(s.statusStunting) === "pendek").length;
    const sangatPendek = statusGizi.filter(s => norm(s.statusStunting) === "sangat pendek").length;

    return NextResponse.json({
      success: true,
      message: "Berhasil mengambil data total",
      data: {
        totalBalita,
        totalIbuHamil,

        // kategori gizi
        giziLebih,
        giziBaik,
        giziKurang,
        giziBuruk,

        // stunting
        stuntingNormal: normal,
        stuntingPendek: pendek + sangatPendek,
      },
    });
  } catch (error: any) {
    console.error("API ERROR /api/pemproGizi/dashboard/total:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data",
        error: error?.message,
      },
      { status: 500 }
    );
  }
}
