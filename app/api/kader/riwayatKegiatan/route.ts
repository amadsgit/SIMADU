import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // === CEK LOGIN ===
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // === AMBIL DATA KADER LOGIN ===
    const kader = await prisma.kader.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        nama: true,
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
      return NextResponse.json({ error: 'Kader tidak ditemukan' }, { status: 404 });
    }

    // === AUTO UPDATE STATUS: ubah kegiatan berjalan yang sudah terlewat ===
    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    await prisma.pelaksanaanKegiatan.updateMany({
      where: {
        kaderId: kader.id,
        status: 'berjalan',
        tanggalMulai: { lt: todayStart },
      },
      data: {
        status: 'selesai',
        tanggalSelesai: now,
      },
    });

    // === AMBIL SEMUA PELAKSANAAN KEGIATAN ===
    const pelaksanaanKegiatan = await prisma.pelaksanaanKegiatan.findMany({
      where: { kaderId: kader.id },
      include: {
        kegiatan: { include: { programKesehatan: true } },
        posyandu: {
          select: {
            id: true,
            nama: true,
            wilayah: true,
            kelurahan: { select: { nama: true } },
          },
        },
        pemeriksaanBalita: { include: { balita: true } },
        pemeriksaanIbuHamil: { include: { ibuHamil: true } },
      },
      orderBy: { tanggalMulai: 'desc' },
    });

    // === REKAP ===
    const totalBalita = pelaksanaanKegiatan.reduce(
      (acc, p) => acc + (p.jumlahBalita ?? 0),
      0
    );
    const totalIbuHamil = pelaksanaanKegiatan.reduce(
      (acc, p) => acc + (p.jumlahIbuHamil ?? 0),
      0
    );

    const rekap = {
      totalPelaksanaan: pelaksanaanKegiatan.length,
      totalBalita,
      totalIbuHamil,
      namaPosyandu: kader.posyandu?.nama || '-',
      wilayah: kader.posyandu?.wilayah || '-',
      kelurahan: kader.posyandu?.kelurahan?.nama || '-',
      namaKader: kader.nama,
    };

    return NextResponse.json({
      status: 'success',
      rekap,
      pelaksanaanKegiatan,
    });
  } catch (err: any) {
    console.error('[GET /api/kader/riwayatKegiatan]', err);
    return NextResponse.json(
      { error: 'Gagal mengambil data riwayat kegiatan', detail: err.message },
      { status: 500 }
    );
  }
}
