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
// PUT: Update data Ibu Hamil berdasarkan ID (Match POST Logic)
// ========================================================
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
    }

    const body = await request.json();

    const {
      nama,
      nik,
      noKK,
      tanggalLahir,
      BBSH,
      TBSH,
      liLA,
      tanggalHPHT,
      gravida,
      para,
      abortus,
      golonganDarah,
      kepemilikanJKN,
      noJKN,
      kepemilikanBukuKIA,
      namaSuami,
      HPSuami,
      alamat,
      RT,
      RW,
      longitude,
      latitude,
      posyanduId,
      kaderId,
    } = body;

    // =====================================================
    // Cek apakah data ada
    // =====================================================
    const existingIbu = await prisma.ibuHamil.findUnique({
      where: { id: numericId },
    });

    if (!existingIbu) {
      return NextResponse.json(
        { error: "Data ibu hamil tidak ditemukan." },
        { status: 404 }
      );
    }

    // =====================================================
    // Cek NIK unik jika diubah
    // =====================================================
    if (nik && nik !== existingIbu.nik) {
      const nikUsed = await prisma.ibuHamil.findUnique({ where: { nik } });
      if (nikUsed) {
        return NextResponse.json(
          { error: "NIK ibu hamil sudah digunakan." },
          { status: 400 }
        );
      }
    }

    // =====================================================
    // Validator posyandu / kader jika ada
    // =====================================================
    if (posyanduId !== undefined && posyanduId !== null) {
      const pos = await prisma.posyandu.findUnique({
        where: { id: Number(posyanduId) },
      });
      if (!pos) {
        return NextResponse.json(
          { error: "Posyandu tidak ditemukan." },
          { status: 400 }
        );
      }
    }

    if (kaderId !== undefined && kaderId !== null) {
      const kad = await prisma.kader.findUnique({
        where: { id: Number(kaderId) },
      });
      if (!kad) {
        return NextResponse.json(
          { error: "Kader tidak ditemukan." },
          { status: 400 }
        );
      }
    }

    // =====================================================
    // Convert angka
    // =====================================================
    const toFloat = (val: any) =>
      val !== undefined && val !== null && val !== "" ? parseFloat(val) : null;

    const toInt = (val: any) =>
      val !== undefined && val !== null && val !== "" ? parseInt(val) : null;

    const lon =
      longitude !== undefined && longitude !== null && longitude !== ""
        ? parseFloat(longitude)
        : existingIbu.longitude;

    const lat =
      latitude !== undefined && latitude !== null && latitude !== ""
        ? parseFloat(latitude)
        : existingIbu.latitude;

    // =====================================================
    // Hitung ulang HPL & Umur Kehamilan
    // =====================================================
    let calculatedHPL: Date | null = existingIbu.tanggalHPL;
    let umurAwal: number | null = existingIbu.umurKehamilanAwal;

    if (tanggalHPHT) {
      const hpht = new Date(tanggalHPHT);

      const hpl = new Date(hpht);
      hpl.setDate(hpht.getDate() + 7);
      hpl.setMonth(hpht.getMonth() + 9);
      calculatedHPL = hpl;

      const now = new Date();
      umurAwal = Math.floor(
        (now.getTime() - hpht.getTime()) / (1000 * 60 * 60 * 24 * 7)
      );
      if (umurAwal < 0) umurAwal = 0;
    }

    // =====================================================
    // Hitung ulang IMT & KEK 
    // =====================================================
    let calculatedIMT: number | null = existingIbu.IMTSH;
    let calculatedKEK: string = existingIbu.StatusGiziKEK;

    const bb = toFloat(BBSH);
    const tb = toFloat(TBSH);
    const lilaVal = toFloat(liLA);

    if (bb && tb) {
      const tbMeter = tb / 100;
      if (bb > 0 && tbMeter > 0) {
        calculatedIMT = parseFloat((bb / (tbMeter * tbMeter)).toFixed(2));
      }
    }

    if (lilaVal !== null) {
      calculatedKEK = lilaVal < 23.5 ? "KEK" : "Tidak KEK";
    }

    // =====================================================
    // UPDATE DATABASE
    // =====================================================
    const updatedIbu = await prisma.ibuHamil.update({
      where: { id: numericId },
      data: {
        nama: nama ?? existingIbu.nama,
        nik: nik ?? existingIbu.nik,
        noKK: noKK ?? existingIbu.noKK,

        tanggalLahir: tanggalLahir
          ? new Date(tanggalLahir)
          : existingIbu.tanggalLahir,

        // Data kesehatan
        BBSH: bb ?? existingIbu.BBSH,
        TBSH: tb ?? existingIbu.TBSH,
        liLA: lilaVal ?? existingIbu.liLA,
        IMTSH: calculatedIMT,
        StatusGiziKEK: calculatedKEK,

        // Kehamilan
        tanggalHPHT: tanggalHPHT
          ? new Date(tanggalHPHT)
          : existingIbu.tanggalHPHT,
        tanggalHPL: calculatedHPL,
        umurKehamilanAwal: umurAwal,

        gravida: toInt(gravida) ?? existingIbu.gravida,
        para: toInt(para) ?? existingIbu.para,
        abortus: toInt(abortus) ?? existingIbu.abortus,

        golonganDarah: golonganDarah ?? existingIbu.golonganDarah,
        kepemilikanJKN: kepemilikanJKN ?? existingIbu.kepemilikanJKN,
        noJKN: noJKN ?? existingIbu.noJKN,

        kepemilikanBukuKIA:
          kepemilikanBukuKIA ?? existingIbu.kepemilikanBukuKIA,

        namaSuami: namaSuami ?? existingIbu.namaSuami,
        HPSuami: HPSuami ?? existingIbu.HPSuami,

        alamat: alamat ?? existingIbu.alamat,
        RT: RT ?? existingIbu.RT,
        RW: RW ?? existingIbu.RW,

        longitude: lon,
        latitude: lat,

        posyanduId:
          posyanduId !== undefined && posyanduId !== null
            ? Number(posyanduId)
            : existingIbu.posyanduId,

        kaderId:
          kaderId !== undefined && kaderId !== null
            ? Number(kaderId)
            : existingIbu.kaderId,
      },

      include: {
        posyandu: { select: { id: true, nama: true } },
        kader: { select: { id: true, nama: true } },
      },
    });

    return NextResponse.json({
      message: "Data ibu hamil berhasil diperbarui.",
      data: updatedIbu,
    });
  } catch (error: any) {
    console.error("[PUT IbuHamil]", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data ibu hamil.", detail: error.message },
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
