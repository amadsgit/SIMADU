
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Fungsi bantu untuk membuat slug dari nama
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // hapus karakter spesial
    .replace(/\s+/g, '_')         // ganti spasi dengan _
    .replace(/_+/g, '_');         // hapus tanda _ ganda
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await req.json();

    if (!data.nama || typeof data.nama !== 'string') {
      return NextResponse.json({ error: 'Nama tidak valid' }, { status: 400 });
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        nama: data.nama,
        slug: generateSlug(data.nama),
      },
    });

    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error('[PUT role]', error);
    return NextResponse.json({ error: 'Gagal update role' }, { status: 400 });
  }
}


export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const roleId = id;

    // Cek apakah ada user yang terhubung
    const jumlahUser = await prisma.user.count({
      where: { roleId },
    });

    if (jumlahUser > 0) {
      return NextResponse.json(
        {
          error: 'Role masih memiliki user aktif. Silahkan hapus user terlebih dahulu sebelum menghapus data.',
        },
        { status: 409 } // HTTP 409 Conflict
      );
    }

    await prisma.role.delete({
      where: { id: id},
    });

    return NextResponse.json({ message: 'Role Berhasil dihapus' });
  } catch (error) {
    console.error('[DELETE role]', error);
    return NextResponse.json({ error: 'Gagal menghapus role' }, { status: 400 });
  }
}
