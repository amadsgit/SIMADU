import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// ========================================================
// GET: Ambil semua kegiatan & pelaksanaan untuk Monitoring KIA (lengkap)
// ========================================================
export async function GET() {
  try {
    const kegiatanKIA = await prisma.kegiatan.findMany({
      where: {
        programKesehatan: {
          nama: {
            contains: 'Program KIA',
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
            pemeriksaanIbuHamil: {
              include: {
                ibuHamil: true,
              },
            },
          },
        },
      },
      orderBy: { tanggalPelaksanaan: 'desc' },
    });

    // Format output supaya lebih clean
    const data = kegiatanKIA.map(k => ({
      id: k.id,
      nama: k.nama,
      deskripsi: k.deskripsi,
      tanggalPelaksanaan: k.tanggalPelaksanaan,
      alamat: k.alamat,
      posyandu: k.posyandu,
      programKesehatan: k.programKesehatan,
      pelaksanaan: k.pelaksanaanKegiatan.map(p => ({
        id: p.id,
        tanggalMulai: p.tanggalMulai,
        tanggalSelesai: p.tanggalSelesai,
        status: p.status,
        posyandu: p.posyandu,
        kader: p.kader,
        jumlahBalita: p.pemeriksaanBalita.length,
        jumlahIbuHamil: p.pemeriksaanIbuHamil.length,
        catatanUmum: p.catatanUmum,
        pemeriksaanBalita: p.pemeriksaanBalita.map(b => ({
          id: b.id,
          tanggal: b.tanggal,
          balita: b.balita,
          beratBadan: b.beratBadan,
          tinggiBadan: b.tinggiBadan,
          lingkarKepala: b.lingkarKepala,
          imunisasi: b.imunisasi,
          vitamin: b.vitamin,
          jenisVitamin: b.jenisVitamin,
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
        pemeriksaanIbuHamil: p.pemeriksaanIbuHamil.map(i => ({
          id: i.id,
          tanggal: i.tanggal,
          ibuHamil: i.ibuHamil,
          usiaKehamilan: i.usiaKehamilan,
          beratBadan: i.beratBadan,
          tekananDarah: i.tekananDarah,
          tinggiFundus: i.tinggiFundus,
          detakJantungJanin: i.detakJantungJanin,
          pemberianFe: i.pemberianFe,
          pmt: i.pmt,
          jenisPmt: i.jenisPmt,
          keluhan: i.keluhan,
          tindakan: i.tindakan,
          konseling: i.konseling,
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
