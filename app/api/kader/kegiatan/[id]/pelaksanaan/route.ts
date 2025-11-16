import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NextRequest, NextResponse } from 'next/server';


// =====================================================
// GET: Ambil detail kegiatan + status pelaksanaan
// =====================================================
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const kegiatanId = Number(id);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kader = await prisma.kader.findUnique({
      where: { userId: session.user.id },
      select: { id: true, posyanduId: true },
    });
    if (!kader) {
      return NextResponse.json({ error: 'Kader tidak ditemukan' }, { status: 404 });
    }


    // AUTO UPDATE STATUS: Ubah kegiatan berjalan yang sudah lewat jadi selesai
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setHours(0, 0, 0, 0); // patokan jam 00:00 hari ini

    await prisma.pelaksanaanKegiatan.updateMany({
      where: {
        posyanduId: kader.posyanduId,
        status: 'berjalan',
        tanggalMulai: { lt: yesterday },
      },
      data: {
        status: 'selesai',
        tanggalSelesai: now,
      },
    });


    // Ambil data kegiatan & pelaksanaan
    const kegiatan = await prisma.kegiatan.findUnique({
      where: { id: kegiatanId },
      include: {
        posyandu: {
          select: {
            id: true,
            nama: true,
            wilayah: true,
            kelurahan: { select: { id: true, nama: true } },
          },
        },
        programKesehatan: { select: { id: true, nama: true } },
      },
    });

    if (!kegiatan || kegiatan.posyanduId !== kader.posyanduId) {
      return NextResponse.json(
        { error: 'Kegiatan tidak ditemukan untuk posyandu ini' },
        { status: 403 }
      );
    }

    const pelaksanaan = await prisma.pelaksanaanKegiatan.findFirst({
      where: {
        kegiatanId,
        posyanduId: kader.posyanduId,
        kaderId: kader.id,
      },
    });

    return NextResponse.json({ kegiatan, pelaksanaan });
  } catch (err: any) {
    console.error('[GET /api/kader/kegiatan/[id]/pelaksanaan]', err);
    return NextResponse.json(
      { error: 'Gagal mengambil data pelaksanaan', detail: err.message },
      { status: 500 }
    );
  }
}


// =====================================================
// POST: Mulai pelaksanaan kegiatan
// =====================================================
export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const kegiatanId = Number(id);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kader = await prisma.kader.findUnique({
      where: { userId: session.user.id },
      select: { id: true, posyanduId: true },
    });
    if (!kader) {
      return NextResponse.json({ error: 'Kader tidak ditemukan' }, { status: 404 });
    }

    // Cek apakah sudah ada pelaksanaan berjalan
    const existing = await prisma.pelaksanaanKegiatan.findFirst({
      where: {
        kegiatanId,
        posyanduId: kader.posyanduId,
        status: 'berjalan',
      },
    });
    if (existing) return NextResponse.json(existing);

    const newPelaksanaan = await prisma.pelaksanaanKegiatan.create({
      data: {
        kegiatanId,
        posyanduId: kader.posyanduId,
        kaderId: kader.id,
        status: 'berjalan',
        tanggalMulai: new Date(),
      },
    });

    return NextResponse.json(newPelaksanaan);
  } catch (err: any) {
    console.error('[POST /api/kader/kegiatan/[id]/pelaksanaan]', err);
    return NextResponse.json(
      { error: 'Gagal memulai pelaksanaan', detail: err.message },
      { status: 500 }
    );
  }
}


// =====================================================
// PATCH: Selesaikan kegiatan
// =====================================================
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const kegiatanId = Number(id);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kader = await prisma.kader.findUnique({
      where: { userId: session.user.id },
      select: { id: true, posyanduId: true },
    });
    if (!kader) {
      return NextResponse.json({ error: 'Kader tidak ditemukan' }, { status: 404 });
    }

    const { catatanUmum } = await req.json();

    // Cari pelaksanaan yang sedang berjalan
    const pelaksanaan = await prisma.pelaksanaanKegiatan.findFirst({
      where: {
        kegiatanId,
        posyanduId: kader.posyanduId,
        kaderId: kader.id,
        status: 'berjalan',
      },
    });

    if (!pelaksanaan) {
      return NextResponse.json(
        { error: 'Pelaksanaan tidak ditemukan atau sudah selesai' },
        { status: 404 }
      );
    }

    // Hitung jumlah peserta berdasarkan pelaksanaanKegiatanId
    const [jumlahBalita, jumlahIbuHamil] = await Promise.all([
      prisma.pemeriksaanBalita.count({ where: { pelaksanaanKegiatanId: pelaksanaan.id } }),
      prisma.pemeriksaanIbuHamil.count({ where: { pelaksanaanKegiatanId: pelaksanaan.id } }),
    ]);

    // Update pelaksanaan
    const updated = await prisma.pelaksanaanKegiatan.update({
      where: { id: pelaksanaan.id },
      data: {
        status: 'selesai',
        tanggalSelesai: new Date(),
        jumlahBalita,
        jumlahIbuHamil,
        catatanUmum,
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    console.error('[PATCH /api/kader/kegiatan/[id]/pelaksanaan]', err);
    return NextResponse.json(
      { error: 'Gagal menyelesaikan kegiatan', detail: err.message },
      { status: 500 }
    );
  }
}
