
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';



export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await req.json(); 

    const kelurahan = await prisma.kelurahan.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json(kelurahan);
  } catch (error) {
    console.error('[PUT Kelurahan]', error);
    return NextResponse.json({ error: 'Gagal update kelurahan/desa' }, { status: 400 });
  }
}



export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const kelurahanId = parseInt(id);

    // Cek apakah ada posyandu yang terhubung
    const jumlahPosyandu = await prisma.posyandu.count({
      where: { kelurahanId },
    });

    if (jumlahPosyandu > 0) {
      return NextResponse.json(
        {
          error: 'Kelurahan/Desa masih memiliki posyandu aktif. Silahkan hapus posyandu terlebih dahulu sebelum menghapus data.',
        },
        { status: 409 } // HTTP 409 Conflict
      );
    }

    await prisma.kelurahan.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Berhasil dihapus' });
  } catch (error) {
    console.error('[DELETE Kelurahan]', error);
    return NextResponse.json({ error: 'Gagal menghapus kelurahan/desa' }, { status: 400 });
  }
}
