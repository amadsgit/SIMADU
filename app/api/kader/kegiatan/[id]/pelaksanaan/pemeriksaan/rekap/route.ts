import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NextRequest, NextResponse } from 'next/server';

// =====================================================
// GET: Ambil seluruh data pemeriksaan balita & ibu hamil hari ini milik kader login
// =====================================================
export async function GET(_req: NextRequest) {
  try {
    // Cek sesi login
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil data kader + posyandu + kelurahan
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
            kelurahan: { select: { id: true, nama: true } },
          },
        },
      },
    });

    if (!kader) {
      return NextResponse.json({ error: 'Kader tidak ditemukan' }, { status: 404 });
    }

    // Rentang waktu hari ini
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // Ambil semua pemeriksaan balita & ibu hamil hari ini berdasarkan kader login
    const [pemeriksaanBalita, pemeriksaanIbuHamil] = await Promise.all([
      prisma.pemeriksaanBalita.findMany({
        where: {
          kaderId: kader.id,
          tanggal: { gte: startOfDay, lte: endOfDay },
        },
        include: {
          balita: {
            select: {
              id: true,
              nama: true,
              nik: true,
              tanggalLahir: true,
              jenisKelamin: true,
              namaAyah: true,
              namaIbu: true,
              alamat: true,
            },
          },
          kegiatan: {
            select: {
              id: true,
              nama: true,
              programKesehatan: { select: { id: true, nama: true } },
            },
          },
        },
        orderBy: { tanggal: 'desc' },
      }),
      prisma.pemeriksaanIbuHamil.findMany({
        where: {
          kaderId: kader.id,
          tanggal: { gte: startOfDay, lte: endOfDay },
        },
        include: {
          ibuHamil: {
            select: {
              id: true,
              nama: true,
              nik: true,
              tanggalLahir: true,
              umurKehamilanAwal: true,
              tanggalHPHT: true,
              tanggalHPL: true,
              gravida: true,
              para: true,
              abortus: true,
              alamat: true,
            },
          },
          kegiatan: {
            select: {
              id: true,
              nama: true,
              programKesehatan: { select: { id: true, nama: true } },
            },
          },
        },
        orderBy: { tanggal: 'desc' },
      }),
    ]);

    // Buat rekap hasil kegiatan hari ini
    const rekap = {
      tanggal: new Date().toISOString().split('T')[0],
      posyanduId: kader.posyanduId,
      namaPosyandu: kader.posyandu?.nama || '-',
      wilayahPosyandu: kader.posyandu?.wilayah || '-',
      kelurahan: kader.posyandu?.kelurahan?.nama || '-',
      namaKader: kader.nama,
      jumlahBalita: pemeriksaanBalita.length,
      jumlahIbuHamil: pemeriksaanIbuHamil.length,
      totalPemeriksaan: pemeriksaanBalita.length + pemeriksaanIbuHamil.length,
    };

    // Kembalikan data lengkap
    return NextResponse.json({
      status: 'success',
      rekap,
      pemeriksaanBalita,
      pemeriksaanIbuHamil,
    });
  } catch (err: any) {
    console.error('[GET /api/kader/pemeriksaan/rekap]', err);
    return NextResponse.json(
      { error: 'Gagal mengambil data pemeriksaan', detail: err.message },
      { status: 500 }
    );
  }
}
