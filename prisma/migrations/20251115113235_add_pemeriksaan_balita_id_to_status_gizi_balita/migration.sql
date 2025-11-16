-- AlterTable
ALTER TABLE "public"."StatusGiziBalita" ADD COLUMN     "pemeriksaanBalitaId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."StatusGiziBalita" ADD CONSTRAINT "StatusGiziBalita_pemeriksaanBalitaId_fkey" FOREIGN KEY ("pemeriksaanBalitaId") REFERENCES "public"."PemeriksaanBalita"("id") ON DELETE SET NULL ON UPDATE CASCADE;
