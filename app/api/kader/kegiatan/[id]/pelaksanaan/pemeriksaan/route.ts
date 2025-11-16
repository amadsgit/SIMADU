import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NextRequest, NextResponse } from 'next/server';
import { hitungZScoreWHO } from '@/lib/who/zscore';

type ContextParams = { params: Promise<{ id: string }> };

// =====================================================
// GET: Ambil daftar peserta (tanpa filter program)
// =====================================================
export async function GET(_req: NextRequest, context: ContextParams) {
  try {
    const { id } = await context.params;
    const kegiatanId = Number(id);

    if (Number.isNaN(kegiatanId)) {
      return NextResponse.json({ error: 'ID kegiatan tidak valid' }, { status: 400 });
    }

    // Cek session kader login
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil data kader aktif
    const kader = await prisma.kader.findUnique({
      where: { userId: session.user.id },
      select: { id: true, posyanduId: true },
    });

    if (!kader) {
      return NextResponse.json({ error: 'Kader tidak ditemukan' }, { status: 404 });
    }

    // Ambil data kegiatan
    const kegiatan = await prisma.kegiatan.findUnique({
      where: { id: kegiatanId },
      select: {
        id: true,
        nama: true,
        deskripsi: true,
        tanggalPelaksanaan: true,
        alamat: true,
        posyanduId: true,
        programKesehatan: { select: { id: true, nama: true } },
      },
    });

    if (!kegiatan) {
      return NextResponse.json({ error: 'Kegiatan tidak ditemukan' }, { status: 404 });
    }

    if (kegiatan.posyanduId !== kader.posyanduId) {
      return NextResponse.json(
        { error: 'Kegiatan tidak untuk posyandu kader ini' },
        { status: 403 }
      );
    }

    // =============================
    // Ambil semua peserta di posyandu kader
    // =============================
    const peserta = {
      balita: await prisma.balita.findMany({
        where: { posyanduId: kader.posyanduId },
        orderBy: { nama: 'asc' },
        select: { id: true, nama: true, nik: true },
      }),
      ibuHamil: await prisma.ibuHamil.findMany({
        where: { posyanduId: kader.posyanduId },
        orderBy: { nama: 'asc' },
        select: { id: true, nama: true, nik: true },
      }),
    };

    return NextResponse.json({
      success: true,
      kegiatan: {
        id: kegiatan.id,
        nama: kegiatan.nama,
        tanggalPelaksanaan: kegiatan.tanggalPelaksanaan,
        program: kegiatan.programKesehatan?.nama || null,
      },
      peserta,
    });
  } catch (err: any) {
    console.error('[GET /api/kader/kegiatan/[id]/pelaksanaan/pemeriksaan]', err);
    return NextResponse.json(
      { error: 'Gagal mengambil daftar peserta', detail: err.message },
      { status: 500 }
    );
  }
}


// =====================================================
// POST: Simpan pemeriksaan baru (balita / ibu hamil)
// =====================================================
export async function POST(req: NextRequest, context: ContextParams) {
  try {
    const { id } = await context.params;
    const kegiatanId = Number(id);
    if (Number.isNaN(kegiatanId)) {
      return NextResponse.json({ error: 'ID kegiatan tidak valid' }, { status: 400 });
    }

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

    const kegiatan = await prisma.kegiatan.findUnique({
      where: { id: kegiatanId },
      select: { id: true, posyanduId: true, programKesehatan: { select: { nama: true } } },
    });
    if (!kegiatan) {
      return NextResponse.json({ error: 'Kegiatan tidak ditemukan' }, { status: 404 });
    }
    if (kegiatan.posyanduId !== kader.posyanduId) {
      return NextResponse.json({ error: 'Kegiatan tidak untuk posyandu kader ini' }, { status: 403 });
    }

    const payload = await req.json();
    const type = payload.type as string | undefined;

    if (!type || !['balita', 'ibuHamil'].includes(type)) {
      return NextResponse.json({ error: 'Field "type" harus diisi: "balita" atau "ibuHamil"' }, { status: 400 });
    }

    // Validasi berdasarkan nama program
    const programName = kegiatan.programKesehatan?.nama?.toLowerCase() || '';
    const allowedTypes: string[] =
      programName.includes('kia')
        ? ['balita', 'ibuHamil']
        : programName.includes('imunisasi') || programName.includes('gizi')
        ? ['balita']
        : ['balita'];

    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: `Tipe "${type}" tidak diperbolehkan untuk program ini` }, { status: 400 });
    }



    // -----------------------
    // Create pemeriksaanBalita + Hitung Status Gizi WHO
    // -----------------------
    if (type === 'balita') {
      const {
        balitaId,
        tanggal,
        beratBadan,
        tinggiBadan,
        lingkarKepala,
        imunisasi,
        vitamin,
        jenisVitamin,
        pmt,
        jenisPmt,
        keluhan,
        tindakan,
        catatan,
        pelaksanaanKegiatanId,
      } = payload;

      if (!balitaId || !tanggal || typeof beratBadan === 'undefined' || typeof tinggiBadan === 'undefined') {
        return NextResponse.json(
          { error: 'Field wajib: balitaId, tanggal, beratBadan, tinggiBadan' },
          { status: 400 }
        );
      }

      // ----------------------------
      // 1. Simpan pemeriksaan balita
      // ----------------------------
      const pemeriksaan = await prisma.pemeriksaanBalita.create({
        data: {
          balitaId: Number(balitaId),
          kegiatanId,
          tanggal: new Date(tanggal),
          beratBadan: Number(beratBadan),
          tinggiBadan: Number(tinggiBadan),
          lingkarKepala: lingkarKepala ? Number(lingkarKepala) : null,
          imunisasi: imunisasi ?? null,
          vitamin: typeof vitamin !== 'undefined' ? Boolean(vitamin) : null,
          jenisVitamin: jenisVitamin ?? null,
          pmt: typeof pmt !== 'undefined' ? Boolean(pmt) : null,
          jenisPmt: jenisPmt ?? null,
          keluhan: keluhan ?? null,
          tindakan: tindakan ?? null,
          catatan: catatan ?? null,
          kaderId: kader.id,
          pelaksanaanKegiatanId: pelaksanaanKegiatanId ? Number(pelaksanaanKegiatanId) : null,
        },
      });

      // ----------------------------
      // 2. Ambil data balita
      // ----------------------------
      const balita = await prisma.balita.findUnique({
        where: { id: Number(balitaId) },
        select: { tanggalLahir: true, jenisKelamin: true },
      });

      if (!balita) {
        return NextResponse.json({ error: 'Data balita tidak ditemukan' }, { status: 404 });
      }

      // ----------------------------
      // 3. Hitung Z-SCORE WHO RESMI
      // ----------------------------
      const z = hitungZScoreWHO({
        tanggalLahir: balita.tanggalLahir,
        tanggalPengukuran: tanggal,
        jenisKelamin: balita.jenisKelamin === 'L' ? 'L' : 'P',
        beratBadan: Number(beratBadan),
        tinggiBadan: Number(tinggiBadan),
      });

      if (z.error) {
        return NextResponse.json({ error: z.error }, { status: 400 });
      }

      const {
        zBBU = null,
        zTBU = null,
        zBBTB = null,
        kategoriGizi = 'Gizi Baik'
      } = z;

      // ----------------------------
      // 3B. Hitung Status Stunting
      // ----------------------------
      let statusStunting = 'Normal';

      if (zTBU !== null) {
        if (zTBU < -3) statusStunting = 'Sangat Pendek';
        else if (zTBU < -2) statusStunting = 'Pendek';
      }

      // ----------------------------
      // 4. Insert ke tabel StatusGiziBalita
      // ----------------------------
      await prisma.statusGiziBalita.create({
        data: {
          balitaId: Number(balitaId),
          pemeriksaanBalitaId: pemeriksaan.id, // <-- relasi ke pemeriksaanBalita
          tanggal: new Date(tanggal),
          beratBadan: Number(beratBadan),
          tinggiBadan: Number(tinggiBadan),
          zScoreBBU: zBBU,
          zScoreTBU: zTBU,
          zScoreBBTB: zBBTB,
          kategoriGizi,
          statusStunting,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Pemeriksaan balita tersimpan & status gizi dihitung',
        data: pemeriksaan,
      });
    }



    // ---------------------------
    // Create pemeriksaanIbuHamil
    // ---------------------------
    if (type === 'ibuHamil') {
      const {
        ibuHamilId,
        tanggal,
        usiaKehamilan,
        beratBadan,
        tekananDarah,
        tinggiFundus,
        detakJantungJanin,
        pemberianFe,
        pmt,
        jenisPmt,
        keluhan,
        tindakan,
        konseling,
        pelaksanaanKegiatanId,
      } = payload;

      if (!ibuHamilId || !tanggal || typeof usiaKehamilan === 'undefined') {
        return NextResponse.json({ error: 'Field wajib: ibuHamilId, tanggal, usiaKehamilan' }, { status: 400 });
      }

      const pemeriksaan = await prisma.pemeriksaanIbuHamil.create({
        data: {
          ibuHamilId: Number(ibuHamilId),
          kegiatanId,
          tanggal: new Date(tanggal),
          usiaKehamilan: Number(usiaKehamilan),
          beratBadan: beratBadan ? Number(beratBadan) : null,
          tekananDarah: tekananDarah ?? null,
          tinggiFundus: tinggiFundus ? Number(tinggiFundus) : null,
          detakJantungJanin: detakJantungJanin ? Number(detakJantungJanin) : null,
          pemberianFe: typeof pemberianFe !== 'undefined' ? Boolean(pemberianFe) : null,
          pmt: typeof pmt !== 'undefined' ? Boolean(pmt) : null,
          jenisPmt: jenisPmt ?? null,
          keluhan: keluhan ?? null,
          tindakan: tindakan ?? null,
          konseling: konseling ?? null,
          kaderId: kader.id,
          pelaksanaanKegiatanId: pelaksanaanKegiatanId ? Number(pelaksanaanKegiatanId) : null,
        },
      });

      return NextResponse.json({ success: true, message: 'Pemeriksaan ibu hamil tersimpan', data: pemeriksaan });
    }

    return NextResponse.json({ error: 'Unhandled type' }, { status: 400 });
  } catch (err: any) {
    console.error('[POST /api/kader/kegiatan/[id]/pemeriksaan]', err);
    return NextResponse.json({ error: 'Gagal menyimpan pemeriksaan', detail: err.message }, { status: 500 });
  }
}
