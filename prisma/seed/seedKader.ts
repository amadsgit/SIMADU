import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Cari Posyandu yang sudah dibuat
  const posyandu = await prisma.posyandu.findFirst({
    where: { nama: 'Posyandu Melati' },
  });

  if (!posyandu) {
    throw new Error('Posyandu Melati belum ada di database.');
  }

  // Tambahkan kader
  await prisma.kader.createMany({
    data: [
      {
        nama: 'Aisyah Nurhaliza',
        nik: '3201010101010001',
        noHp: '081234567801',
        alamat: 'Jl. Mawar No. 1',
        posyanduId: posyandu.id,
      },
      {
        nama: 'Dewi Sartika',
        nik: '3201010101010002',
        noHp: '081234567802',
        alamat: 'Jl. Kenanga No. 2',
        posyanduId: posyandu.id,
      }
    ],
    skipDuplicates: true,
  });

  console.log('Posyandu dan kader berhasil disimpan!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
