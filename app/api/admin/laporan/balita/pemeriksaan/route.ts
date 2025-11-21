// /app/api/admin/laporan/balita/pemeriksaan/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // ambil semua pemeriksaan balita beserta pelaksanaan kegiatan
    const data = await prisma.pemeriksaanBalita.findMany({
      orderBy: { id: 'desc' },
      include: {
        balita: {
          select: {
            id: true,
            nama: true,
            tanggalLahir: true,
            nik: true,
            noKK: true,
            posyandu: {
              select: {
                id: true,
                nama: true,
                wilayah: true,
                kelurahan: {
                  select: { id: true, nama: true },
                },
              },
            },
          },
        },
        kader: {
          select: { id: true, nama: true },
        },
        pelaksanaanKegiatan: {
          select: {
            id: true,
            tanggalMulai: true,
            tanggalSelesai: true,
            status: true,
            kegiatan: {
              select: { id: true, nama: true },
            },
          },
        },
        statusGizi: true, // semua status gizi yang terkait dengan pemeriksaan ini
      },
    });

    return NextResponse.json({
      success: true,
      total: data.length,
      data,
    });

  } catch (error: any) {
    console.error('Error GET Pemeriksaan Balita:', error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
