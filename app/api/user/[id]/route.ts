import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// ========================================================
// GET: Ambil detail user berdasarkan ID
// ========================================================
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id: (id) },
      include: {
        role: { select: { id: true, nama: true } },
        kader: {
          include: {
            posyandu: {
              select: { id: true, nama: true, wilayah: true },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[GET User]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data user.' },
      { status: 500 }
    );
  }
}

// ========================================================
// PUT: Update data user berdasarkan ID
// ========================================================
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const {
      nama,
      email,
      noHp,
      noKK,
      nik,
      tanggalLahir,
      alamat,
      password,
      roleId,
      posyanduId,
    } = body;

    const user = await prisma.user.findUnique({ where: { id: (id) } });
    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Jika ada password baru, hash ulang
    let hashedPassword = user.password;
    if (password && password.trim().length >= 8) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: (id) },
      data: {
        nama,
        email,
        noHp,
        noKK,
        nik,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : user.tanggalLahir,
        alamat,
        password: hashedPassword,
        roleId,
      },
      include: {
        role: { select: { id: true, nama: true } },
      },
    });

    // Update data kader jika role kader
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (role?.nama.toLowerCase() === 'kader') {
      const existingKader = await prisma.kader.findUnique({
        where: { userId: updatedUser.id },
      });

      if (existingKader) {
        await prisma.kader.update({
          where: { id: existingKader.id },
          data: { nama, nik, noHp, alamat, posyanduId },
        });
      } else {
        if (!posyanduId) {
          return NextResponse.json(
            { error: 'Kader harus memiliki posyanduId!' },
            { status: 400 }
          );
        }

        await prisma.kader.create({
          data: { nama, nik, noHp, alamat, posyanduId, userId: updatedUser.id },
        });
      }
    }

    return NextResponse.json({
      message: 'Data user berhasil diperbarui.',
      data: updatedUser,
    });
  } catch (error) {
    console.error('[PUT User]', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui data user.' },
      { status: 500 }
    );
  }
}

// ========================================================
// DELETE: Hapus user berdasarkan ID (tanpa hapus data kader)
// ========================================================
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id: (id) },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan.' },
        { status: 404 }
      );
    }

    // hanya hapus user dari tabel user
    await prisma.user.delete({ where: { id: (id) } });

    return NextResponse.json({ message: 'Akun user berhasil dihapus.' });
  } catch (error) {
    console.error('[DELETE User]', error);
    return NextResponse.json(
      { error: 'Gagal menghapus user.' },
      { status: 500 }
    );
  }
}
