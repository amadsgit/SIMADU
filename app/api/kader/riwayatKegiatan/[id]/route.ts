import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ==== AWAIT PARAMS ====
    const { id } = await context.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

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

    // === CEK APAKAH PELAKSANAAN MILIK KADER ===
    const pelaksanaan = await prisma.pelaksanaanKegiatan.findFirst({
      where: {
        id: numericId,
        kaderId: kader.id,
      },
      include: {
        kegiatan: {
          include: {
            programKesehatan: true,
          },
        },
      },
    });

    if (!pelaksanaan) {
      return NextResponse.json(
        { error: 'Pelaksanaan kegiatan tidak ditemukan' },
        { status: 404 }
      );
    }

    // === AMBIL DATA PEMERIKSAAN ===
    const [pemeriksaanBalita, pemeriksaanIbuHamil] = await Promise.all([
      prisma.pemeriksaanBalita.findMany({
        where: { pelaksanaanKegiatanId: numericId },
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
        },
        orderBy: { tanggal: 'desc' },
      }),
      prisma.pemeriksaanIbuHamil.findMany({
        where: { pelaksanaanKegiatanId: numericId },
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
        },
        orderBy: { tanggal: 'desc' },
      }),
    ]);

    // === REKAP ===
    const rekap = {
      idPelaksanaan: pelaksanaan.id,
      tanggalMulai: pelaksanaan.tanggalMulai,
      tanggalSelesai: pelaksanaan.tanggalSelesai,
      namaKegiatan: pelaksanaan.kegiatan?.nama || '-',
      program: pelaksanaan.kegiatan?.programKesehatan?.nama || '-',
      status: pelaksanaan.status,
      namaKader: kader.nama,
      namaPosyandu: kader.posyandu?.nama || '-',
      wilayah: kader.posyandu?.wilayah || '-',
      kelurahan: kader.posyandu?.kelurahan?.nama || '-',
      jumlahBalita: pemeriksaanBalita.length,
      jumlahIbuHamil: pemeriksaanIbuHamil.length,
      totalPemeriksaan: pemeriksaanBalita.length + pemeriksaanIbuHamil.length,
    };

    return NextResponse.json({
      status: 'success',
      rekap,
      pemeriksaanBalita,
      pemeriksaanIbuHamil,
    });
  } catch (error: any) {
    console.error('[GET /api/kader/riwayatKegiatan/[id]]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data rekap kegiatan', detail: error.message },
      { status: 500 }
    );
  }
}
