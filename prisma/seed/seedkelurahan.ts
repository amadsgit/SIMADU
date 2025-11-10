import { PrismaClient } from '@/generated/prisma/client';
const prisma = new PrismaClient();

async function main() {
  const kelurahanList = [
    { nama: 'Parung' },
    { nama: 'Wanareja' },
  ];

  for (const kelurahan of kelurahanList) {
    await prisma.kelurahan.upsert({
      where: { nama: kelurahan.nama },
      update: {},
      create: {
        nama: kelurahan.nama,
      },
    });
  }

  console.log('Seed kelurahan berhasil.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
