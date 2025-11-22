import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sendRegisterEmail } from '@/lib/mailerRegister';

// ==============================
// GET: Ambil semua data user
// ==============================
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        role: { select: { id: true, nama: true } },
        kader: {
          include: {
            posyandu: {
              include: {
                kelurahan: {
                  select: { id: true, nama: true },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('[GET user]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data user' },
      { status: 500 }
    );
  }
}

// ==============================
// POST: Tambah user baru
// ==============================
export async function POST(req: Request) {
  try {
    const body = await req.json();
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
      kaderId,
    } = body;

    // --- Validasi umum ---
    if (!nama || !email || !noHp || !nik || !tanggalLahir || !alamat || !password || !roleId) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi!' },
        { status: 400 }
      );
    }

    // --- Cek user existing ---
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { nik }] },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email atau NIK sudah terdaftar sebagai user!' },
        { status: 400 }
      );
    }

    // --- Cek role ---
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return NextResponse.json(
        { error: 'Role tidak ditemukan!' },
        { status: 400 }
      );
    }

    // --- Hash password ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- Tentukan role yang auto verified ---
    const isAutoVerified = [
      'admin',
      'kader',
      'pemegang program kia',
      'pemegang program imunisasi',
      'pemegang program gizi',
    ].includes(role.nama.toLowerCase());

    // ==============================
    // TRANSACTION: Buat user + update kader
    // ==============================
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          nama,
          email,
          noHp,
          noKK,
          nik,
          tanggalLahir: new Date(tanggalLahir),
          alamat,
          password: hashedPassword,
          roleId,
          verifiedAt: isAutoVerified ? new Date() : null,
        },
        include: { role: { select: { id: true, nama: true } } },
      });

      // --- Jika role kader, sambungkan ---
      if (role.nama.toLowerCase() === 'kader') {
        if (!kaderId) throw new Error('Kader harus dipilih!');

        const kaderNumericId = Number(kaderId);
        if (isNaN(kaderNumericId)) throw new Error('ID kader tidak valid!');

        const existingKader = await tx.kader.findUnique({
          where: { id: kaderNumericId },
        });

        if (!existingKader) throw new Error('Data kader tidak ditemukan!');

        await tx.kader.update({
          where: { id: kaderNumericId },
          data: { userId: newUser.id },
        });
      }

      return newUser;
    });

    // ==============================
    // KIRIM EMAIL NOTIFIKASI (via helper)
    // ==============================
    await sendRegisterEmail({
      nama,
      email,
      password,
      role: result.role.nama,
    });

    return NextResponse.json({
      message: `User berhasil ditambahkan. Email notifikasi telah dikirim.`,
      data: result,
    });
  } catch (error: any) {
    console.error('[POST user]', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menambahkan user' },
      { status: 500 }
    );
  }
}
