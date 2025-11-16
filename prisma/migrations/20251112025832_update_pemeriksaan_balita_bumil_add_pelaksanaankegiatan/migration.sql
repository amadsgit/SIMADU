-- AlterTable
ALTER TABLE "public"."PemeriksaanBalita" ADD COLUMN     "jenisPmt" TEXT,
ADD COLUMN     "jenisVitamin" TEXT,
ADD COLUMN     "pmt" BOOLEAN,
ADD COLUMN     "tindakan" TEXT,
ALTER COLUMN "tanggal" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."PemeriksaanIbuHamil" ADD COLUMN     "jenisPmt" TEXT,
ADD COLUMN     "pemberianFe" BOOLEAN,
ADD COLUMN     "pmt" BOOLEAN,
ALTER COLUMN "tanggal" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "public"."PelaksanaanKegiatan" (
    "id" SERIAL NOT NULL,
    "kegiatanId" INTEGER NOT NULL,
    "posyanduId" INTEGER NOT NULL,
    "kaderId" INTEGER NOT NULL,
    "tanggalMulai" TIMESTAMP(3),
    "tanggalSelesai" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'belum_mulai',
    "jumlahBalita" INTEGER,
    "jumlahIbuHamil" INTEGER,
    "catatanUmum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PelaksanaanKegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PelaksanaanKegiatan_kegiatanId_idx" ON "public"."PelaksanaanKegiatan"("kegiatanId");

-- CreateIndex
CREATE INDEX "PelaksanaanKegiatan_posyanduId_idx" ON "public"."PelaksanaanKegiatan"("posyanduId");

-- CreateIndex
CREATE INDEX "PelaksanaanKegiatan_kaderId_idx" ON "public"."PelaksanaanKegiatan"("kaderId");

-- AddForeignKey
ALTER TABLE "public"."PelaksanaanKegiatan" ADD CONSTRAINT "PelaksanaanKegiatan_kegiatanId_fkey" FOREIGN KEY ("kegiatanId") REFERENCES "public"."Kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PelaksanaanKegiatan" ADD CONSTRAINT "PelaksanaanKegiatan_posyanduId_fkey" FOREIGN KEY ("posyanduId") REFERENCES "public"."Posyandu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PelaksanaanKegiatan" ADD CONSTRAINT "PelaksanaanKegiatan_kaderId_fkey" FOREIGN KEY ("kaderId") REFERENCES "public"."Kader"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
