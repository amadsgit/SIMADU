/*
  Warnings:

  - The `status` column on the `PelaksanaanKegiatan` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."StatusPelaksanaan" AS ENUM ('belum_mulai', 'berjalan', 'selesai');

-- AlterTable
ALTER TABLE "public"."PelaksanaanKegiatan" DROP COLUMN "status",
ADD COLUMN     "status" "public"."StatusPelaksanaan" NOT NULL DEFAULT 'belum_mulai';

-- AlterTable
ALTER TABLE "public"."PemeriksaanBalita" ADD COLUMN     "pelaksanaanKegiatanId" INTEGER;

-- AlterTable
ALTER TABLE "public"."PemeriksaanIbuHamil" ADD COLUMN     "pelaksanaanKegiatanId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."PemeriksaanBalita" ADD CONSTRAINT "PemeriksaanBalita_pelaksanaanKegiatanId_fkey" FOREIGN KEY ("pelaksanaanKegiatanId") REFERENCES "public"."PelaksanaanKegiatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PemeriksaanIbuHamil" ADD CONSTRAINT "PemeriksaanIbuHamil_pelaksanaanKegiatanId_fkey" FOREIGN KEY ("pelaksanaanKegiatanId") REFERENCES "public"."PelaksanaanKegiatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
