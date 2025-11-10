import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// ========================================================
// GET: Ambil detail Ibu Hamil berdasarkan ID
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

    const ibuHamil = await prisma.ibuHamil.findUnique({
      where: { id: numericId },
      include: {
        posyandu: {
          include: {
            kelurahan: { select: { id: true, nama: true } },
          },
        },
        kader: { select: { id: true, nama: true } },
        pemeriksaanKehamilan: true,
      },
    });

    if (!ibuHamil) {
      return NextResponse.json(
        { error: 'Data ibu hamil tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json(ibuHamil);
  } catch (error: any) {
    console.error('[GET IbuHamil]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data ibu hamil.' },
      { status: 500 }
    );
  }
}

// ========================================================
// PUT: Update data Ibu Hamil berdasarkan ID
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
      tanggalHPHT,
      gravida,
      para,
      abortus,
      alamat,
      posyanduId,
      kaderId,
    } = body;

    // Cek apakah data ada
    const existingIbu = await prisma.ibuHamil.findUnique({
      where: { id: numericId },
    });

    if (!existingIbu) {
      return NextResponse.json(
        { error: 'Data ibu hamil tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Cek NIK unik (jika diubah)
    if (nik && nik !== existingIbu.nik) {
      const duplicateNIK = await prisma.ibuHamil.findUnique({ where: { nik } });
      if (duplicateNIK) {
        return NextResponse.json(
          { error: 'NIK ibu hamil sudah digunakan.' },
          { status: 400 }
        );
      }
    }

    // Validasi posyandu (jika diberikan)
    if (typeof posyanduId !== 'undefined' && posyanduId !== null) {
      const posyandu = await prisma.posyandu.findUnique({
        where: { id: Number(posyanduId) },
      });
      if (!posyandu) {
        return NextResponse.json(
          { error: 'Posyandu tidak ditemukan.' },
          { status: 400 }
        );
      }
    }

    // Validasi kader (jika diberikan)
    if (typeof kaderId !== 'undefined' && kaderId !== null) {
      const kader = await prisma.kader.findUnique({
        where: { id: Number(kaderId) },
      });
      if (!kader) {
        return NextResponse.json(
          { error: 'Kader tidak ditemukan.' },
          { status: 400 }
        );
      }
    }

    // ====== Kalkulasi Otomatis HPL & Usia Kehamilan ======
    let calculatedHPL: Date | null = existingIbu.tanggalHPL;
    let umurKehamilanAwal: number | null = existingIbu.umurKehamilanAwal;

    if (tanggalHPHT) {
      const hpht = new Date(tanggalHPHT);

      // Rumus Naegele: HPL = HPHT + 7 hari + 9 bulan
      const hpl = new Date(hpht);
      hpl.setDate(hpht.getDate() + 7);
      hpl.setMonth(hpht.getMonth() + 9);
      calculatedHPL = hpl;

      // Hitung usia kehamilan (minggu)
      const now = new Date();
      const diffMs = now.getTime() - hpht.getTime();
      umurKehamilanAwal = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7)); // konversi ke minggu
      if (umurKehamilanAwal < 0) umurKehamilanAwal = 0; // jika HPHT di masa depan
    }

    // Update data ibu hamil
    const updatedIbu = await prisma.ibuHamil.update({
      where: { id: numericId },
      data: {
        nama: nama ?? existingIbu.nama,
        nik: nik ?? existingIbu.nik,
        noKK: noKK ?? existingIbu.noKK,
        tanggalLahir: tanggalLahir
          ? new Date(tanggalLahir)
          : existingIbu.tanggalLahir,
        tanggalHPHT: tanggalHPHT
          ? new Date(tanggalHPHT)
          : existingIbu.tanggalHPHT,
        tanggalHPL: calculatedHPL,
        umurKehamilanAwal,
        gravida:
          typeof gravida !== 'undefined'
            ? Number(gravida)
            : existingIbu.gravida,
        para:
          typeof para !== 'undefined' ? Number(para) : existingIbu.para,
        abortus:
          typeof abortus !== 'undefined'
            ? Number(abortus)
            : existingIbu.abortus,
        alamat: alamat ?? existingIbu.alamat,
        posyanduId:
          typeof posyanduId !== 'undefined' && posyanduId !== null
            ? Number(posyanduId)
            : existingIbu.posyanduId,
        kaderId:
          typeof kaderId !== 'undefined' && kaderId !== null
            ? Number(kaderId)
            : existingIbu.kaderId,
      },
      include: {
        posyandu: { select: { id: true, nama: true } },
        kader: { select: { id: true, nama: true } },
      },
    });

    return NextResponse.json({
      message: 'Data ibu hamil berhasil diperbarui.',
      data: updatedIbu,
    });
  } catch (error: any) {
    console.error('[PUT IbuHamil]', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui data ibu hamil.', detail: error.message },
      { status: 500 }
    );
  }
}

// ========================================================
// DELETE: Hapus data Ibu Hamil berdasarkan ID
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

    const ibuHamil = await prisma.ibuHamil.findUnique({
      where: { id: numericId },
      include: { posyandu: true },
    });

    if (!ibuHamil) {
      return NextResponse.json(
        { error: 'Data ibu hamil tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Hapus data ibu hamil
    await prisma.ibuHamil.delete({ where: { id: numericId } });

    return NextResponse.json({
      message: 'Data ibu hamil berhasil dihapus.',
    });
  } catch (error: any) {
    console.error('[DELETE IbuHamil]', error);
    return NextResponse.json(
      { error: 'Gagal menghapus data ibu hamil.', detail: error.message },
      { status: 500 }
    );
  }
}
