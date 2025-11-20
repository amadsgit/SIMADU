import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Hitung total balita
    const totalBalita = await prisma.balita.count();

    return NextResponse.json({
      success: true,
      message: "Berhasil mengambil data total Balita",
      data: {
        totalBalita
      },
    });
  } catch (error: any) {
    console.error("API ERROR /api/pemproImunisasi/dashboard/total:", error);
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
