import { PrismaClient, Akreditasi } from '@/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Cari kelurahan dengan nama "Parung"
  const kelurahan = await prisma.kelurahan.findFirst({
    where: { nama: 'Parung' },
  });

  if (!kelurahan) {
    throw new Error('Kelurahan "Parung" tidak ditemukan.');
  }

  await prisma.posyandu.create({
    data: {
      nama: 'Posyandu Melati',
      alamat: 'Jl. Curug Lima',
      wilayah: 'RW 01',
      kelurahanId: kelurahan.id, // relasi ke kelurahan
      penanggungJawab: 'Nani Hayati',
      noHp: '081234567001',
      akreditasi: Akreditasi.PARIPURNA,
      longitude: 107.123001,
      latitude: -6.987001,
    },
  });

  console.log('Posyandu berhasil disimpan!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
