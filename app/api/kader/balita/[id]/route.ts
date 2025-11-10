import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ========================================================
// GET: Ambil detail balita berdasarkan ID
// ========================================================
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (Number.isNaN(numericId)) {
      return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 });
    }

    const balita = await prisma.balita.findUnique({
      where: { id: numericId },
      include: {
        posyandu: {
          include: {
            kelurahan: { select: { id: true, nama: true } },
          },
        },
        kader: { select: { id: true, nama: true } },
        pemeriksaanBalita: true,
        statusGizi: true,
      },
    });

    if (!balita) {
      return NextResponse.json({ error: 'Data balita tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json(balita);
  } catch (error: any) {
    console.error('[GET Balita]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data balita.' },
      { status: 500 }
    );
  }
}

// ========================================================
// PUT: Update data balita berdasarkan ID
// ========================================================
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 });
    }

    const body = await request.json();

    const {
      nama,
      nik,
      noKK,
      tanggalLahir,
      jenisKelamin,
      namaAyah,
      namaIbu,
      alamat,
      beratLahir,
      panjangLahir,
      posyanduId,
      kaderId,
    } = body;

    const existingBalita = await prisma.balita.findUnique({
      where: { id: numericId },
    });

    if (!existingBalita) {
      return NextResponse.json(
        { error: 'Data balita tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Cek NIK unik (jika diubah)
    if (nik && nik !== existingBalita.nik) {
      const duplicateNIK = await prisma.balita.findUnique({ where: { nik } });
      if (duplicateNIK) {
        return NextResponse.json(
          { error: 'NIK balita sudah digunakan.' },
          { status: 400 }
        );
      }
    }

    // Validasi posyandu (jika diberikan)
    if (typeof posyanduId !== 'undefined' && posyanduId !== null) {
      const posyandu = await prisma.posyandu.findUnique({ where: { id: Number(posyanduId) } });
      if (!posyandu) {
        return NextResponse.json(
          { error: 'Posyandu tidak ditemukan.' },
          { status: 400 }
        );
      }
    }

    // Validasi kader (jika diberikan)
    if (typeof kaderId !== 'undefined' && kaderId !== null) {
      const kader = await prisma.kader.findUnique({ where: { id: Number(kaderId) } });
      if (!kader) {
        return NextResponse.json(
          { error: 'Kader tidak ditemukan.' },
          { status: 400 }
        );
      }
    }

    // Update data balita
    const updatedBalita = await prisma.balita.update({
      where: { id: numericId },
      data: {
        nama: typeof nama !== 'undefined' ? nama : existingBalita.nama,
        nik: typeof nik !== 'undefined' ? nik : existingBalita.nik,
        noKK: typeof noKK !== 'undefined' ? noKK : existingBalita.noKK,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : existingBalita.tanggalLahir,
        jenisKelamin: typeof jenisKelamin !== 'undefined' ? jenisKelamin : existingBalita.jenisKelamin,
        namaAyah: typeof namaAyah !== 'undefined' ? namaAyah : existingBalita.namaAyah,
        namaIbu: typeof namaIbu !== 'undefined' ? namaIbu : existingBalita.namaIbu,
        alamat: typeof alamat !== 'undefined' ? alamat : existingBalita.alamat,
        beratLahir: typeof beratLahir !== 'undefined' && beratLahir !== null ? Number(beratLahir) : existingBalita.beratLahir,
        panjangLahir: typeof panjangLahir !== 'undefined' && panjangLahir !== null ? Number(panjangLahir) : existingBalita.panjangLahir,
        posyanduId: typeof posyanduId !== 'undefined' && posyanduId !== null ? Number(posyanduId) : existingBalita.posyanduId,
        kaderId: typeof kaderId !== 'undefined' && kaderId !== null ? Number(kaderId) : existingBalita.kaderId,
      },
      include: {
        posyandu: { select: { id: true, nama: true } },
        kader: { select: { id: true, nama: true } },
      },
    });

    return NextResponse.json({
      message: 'Data balita berhasil diperbarui.',
      data: updatedBalita,
    });
  } catch (error: any) {
    console.error('[PUT Balita]', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui data balita.', detail: error.message },
      { status: 500 }
    );
  }
}

// ========================================================
// DELETE: Hapus data balita berdasarkan ID
// ========================================================
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 });
    }

    const balita = await prisma.balita.findUnique({
      where: { id: numericId },
      include: { posyandu: true },
    });

    if (!balita) {
      return NextResponse.json(
        { error: 'Data balita tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Hapus balita dari tabel
    await prisma.balita.delete({ where: { id: numericId } });

    return NextResponse.json({
      message: 'Data balita berhasil dihapus.',
    });
  } catch (error: any) {
    console.error('[DELETE Balita]', error);
    return NextResponse.json(
      { error: 'Gagal menghapus data balita.', detail: error.message },
      { status: 500 }
    );
  }
}
