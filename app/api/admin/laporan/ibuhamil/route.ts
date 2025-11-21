// /app/api/balita/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const data = await prisma.ibuHamil.findMany({
      orderBy: { id: 'desc' },

      include: {
        // === POSYANDU ===
        posyandu: {
          select: {
            id: true,
            nama: true,
            wilayah: true,
            kelurahan: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },

        // === PEMERIKSAAN IbuHamil ===
        pemeriksaanKehamilan: {
          orderBy: { id: 'desc' },
          include: {
            kegiatan: {
              select: { id: true, nama: true },
            },

            kader: {
              select: { id: true, nama: true },
            },

            // === PELAKSANAAN KEGIATAN ===
            pelaksanaanKegiatan: {
              select: {
                id: true,
                tanggalMulai: true,

                kegiatan: {
                  select: { id: true, nama: true },
                },

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

                kader: {
                  select: { id: true, nama: true },
                },
              },
            },
          }
        }
      },
    });

    return NextResponse.json({
      success: true,
      total: data.length,
      data,
    });

  } catch (error: any) {
    console.error('Error GET Balita:', error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
