import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// ========================================================
// GET: Ambil semua kegiatan & pelaksanaan untuk Monitoring Imunisasi (lengkap)
// ========================================================
export async function GET() {
  try {
    const kegiatanImunisasi = await prisma.kegiatan.findMany({
      where: {
        programKesehatan: {
          nama: {
            contains: 'Program Imunisasi',
            mode: 'insensitive',
          },
        },
      },
      include: {
        posyandu: {
          select: {
            id: true,
            nama: true,
            alamat: true,
            wilayah: true,
            kelurahan: { select: { id: true, nama: true } },
          },
        },
        programKesehatan: { select: { id: true, nama: true } },
        pelaksanaanKegiatan: {
          orderBy: { tanggalMulai: 'desc' },
          include: {
            posyandu: { select: { id: true, nama: true } },
            kader: { select: { id: true, nama: true } },
            pemeriksaanBalita: {
              include: {
                balita: true,
                statusGizi: true,
              },
            },
          },
        }, 
      },
      orderBy: { tanggalPelaksanaan: 'desc' },
    });

    const data = kegiatanImunisasi.map(i => ({
      id: i.id,
      nama: i.nama,
      deskripsi: i.deskripsi,
      tanggalPelaksanaan: i.tanggalPelaksanaan,
      alamat: i.alamat,
      posyandu: i.posyandu,
      programKesehatan: i.programKesehatan,
      pelaksanaan: i.pelaksanaanKegiatan.map(p => ({
        id: p.id,
        tanggalMulai: p.tanggalMulai,
        tanggalSelesai: p.tanggalSelesai,
        status: p.status,
        posyandu: p.posyandu,
        kader: p.kader,
        jumlahBalita: p.pemeriksaanBalita.length,
        catatanUmum: p.catatanUmum,
        pemeriksaanBalita: p.pemeriksaanBalita.map(b => ({
          id: b.id,
          tanggal: b.tanggal,
          balita: b.balita,
          beratBadan: b.beratBadan,
          tinggiBadan: b.tinggiBadan,
          lingkarKepala: b.lingkarKepala,
          imunisasi: b.imunisasi,
          pmt: b.pmt,
          jenisPmt: b.jenisPmt,
          keluhan: b.keluhan,
          tindakan: b.tindakan,
          catatan: b.catatan,
          statusGizi: b.statusGizi.map(s => ({
            id: s.id,
            tanggal: s.tanggal,
            beratBadan: s.beratBadan,
            tinggiBadan: s.tinggiBadan,
            zScoreBBU: s.zScoreBBU,
            zScoreTBU: s.zScoreTBU,
            zScoreBBTB: s.zScoreBBTB,
            kategoriGizi: s.kategoriGizi,
            statusStunting: s.statusStunting,
          })),
        })),
      })),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[GET pemproKiaMonitoring]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data monitoring KIA', detail: (error as Error).message },
      { status: 500 }
    );
  }
}
