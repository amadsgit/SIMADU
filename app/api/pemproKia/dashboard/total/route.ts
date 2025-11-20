import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Hitung total balita
    const totalBalita = await prisma.balita.count();

    // Hitung total ibu hamil
    const totalIbuHamil = await prisma.ibuHamil.count();

    return NextResponse.json({
      success: true,
      message: "Berhasil mengambil data total Balita & Ibu Hamil",
      data: {
        totalBalita,
        totalIbuHamil,
      },
    });
  } catch (error: any) {
    console.error("API ERROR /api/pemproKia/dashboard/total:", error);
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
