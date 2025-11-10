import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    'Admin',
    'Pemegang Program KIA',
    'Pemegang Program Imunisasi',
    'Pemegang Program Gizi',
    'Orang Tua Balita',
    'Ibu Hamil',
  ];

  // Buat slug manual pakai underscore
  const data = roles.map((nama) => ({
    nama,
    slug: nama.toLowerCase().replace(/\s+/g, '_'),
  }));

  await prisma.role.createMany({
    data,
    skipDuplicates: true, // biar aman kalau sudah pernah di-seed
  });

  console.log('Data Role berhasil disimpan ke database!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
