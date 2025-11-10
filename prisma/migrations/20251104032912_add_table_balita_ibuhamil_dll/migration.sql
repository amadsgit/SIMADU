-- CreateTable
CREATE TABLE "public"."Balita" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "nik" TEXT,
    "noKK" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "namaAyah" TEXT,
    "namaIbu" TEXT,
    "alamat" TEXT NOT NULL,
    "beratLahir" DOUBLE PRECISION,
    "panjangLahir" DOUBLE PRECISION,
    "posyanduId" INTEGER NOT NULL,
    "kaderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Balita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IbuHamil" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "noKK" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "umurKehamilanAwal" INTEGER,
    "tanggalHPHT" TIMESTAMP(3),
    "tanggalHPL" TIMESTAMP(3),
    "gravida" INTEGER,
    "para" INTEGER,
    "abortus" INTEGER,
    "alamat" TEXT NOT NULL,
    "posyanduId" INTEGER NOT NULL,
    "kaderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IbuHamil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PemeriksaanBalita" (
    "id" SERIAL NOT NULL,
    "balitaId" INTEGER NOT NULL,
    "kegiatanId" INTEGER,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "beratBadan" DOUBLE PRECISION NOT NULL,
    "tinggiBadan" DOUBLE PRECISION NOT NULL,
    "lingkarKepala" DOUBLE PRECISION,
    "imunisasi" TEXT,
    "vitamin" BOOLEAN,
    "keluhan" TEXT,
    "catatan" TEXT,
    "kaderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PemeriksaanBalita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PemeriksaanIbuHamil" (
    "id" SERIAL NOT NULL,
    "ibuHamilId" INTEGER NOT NULL,
    "kegiatanId" INTEGER,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "usiaKehamilan" INTEGER NOT NULL,
    "beratBadan" DOUBLE PRECISION,
    "tekananDarah" TEXT,
    "tinggiFundus" DOUBLE PRECISION,
    "detakJantungJanin" INTEGER,
    "keluhan" TEXT,
    "tindakan" TEXT,
    "konseling" TEXT,
    "kaderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PemeriksaanIbuHamil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StatusGiziBalita" (
    "id" SERIAL NOT NULL,
    "balitaId" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "beratBadan" DOUBLE PRECISION NOT NULL,
    "tinggiBadan" DOUBLE PRECISION NOT NULL,
    "zScoreBBTB" DOUBLE PRECISION,
    "zScoreBBU" DOUBLE PRECISION,
    "zScoreTBU" DOUBLE PRECISION,
    "kategoriGizi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusGiziBalita_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Balita_nik_key" ON "public"."Balita"("nik");

-- CreateIndex
CREATE INDEX "Balita_noKK_idx" ON "public"."Balita"("noKK");

-- CreateIndex
CREATE UNIQUE INDEX "IbuHamil_nik_key" ON "public"."IbuHamil"("nik");

-- CreateIndex
CREATE INDEX "IbuHamil_nik_idx" ON "public"."IbuHamil"("nik");

-- CreateIndex
CREATE INDEX "IbuHamil_noKK_idx" ON "public"."IbuHamil"("noKK");

-- CreateIndex
CREATE INDEX "PemeriksaanBalita_balitaId_idx" ON "public"."PemeriksaanBalita"("balitaId");

-- CreateIndex
CREATE INDEX "PemeriksaanBalita_kegiatanId_idx" ON "public"."PemeriksaanBalita"("kegiatanId");

-- CreateIndex
CREATE INDEX "PemeriksaanIbuHamil_ibuHamilId_idx" ON "public"."PemeriksaanIbuHamil"("ibuHamilId");

-- CreateIndex
CREATE INDEX "PemeriksaanIbuHamil_kegiatanId_idx" ON "public"."PemeriksaanIbuHamil"("kegiatanId");

-- AddForeignKey
ALTER TABLE "public"."Balita" ADD CONSTRAINT "Balita_posyanduId_fkey" FOREIGN KEY ("posyanduId") REFERENCES "public"."Posyandu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Balita" ADD CONSTRAINT "Balita_kaderId_fkey" FOREIGN KEY ("kaderId") REFERENCES "public"."Kader"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IbuHamil" ADD CONSTRAINT "IbuHamil_posyanduId_fkey" FOREIGN KEY ("posyanduId") REFERENCES "public"."Posyandu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IbuHamil" ADD CONSTRAINT "IbuHamil_kaderId_fkey" FOREIGN KEY ("kaderId") REFERENCES "public"."Kader"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PemeriksaanBalita" ADD CONSTRAINT "PemeriksaanBalita_balitaId_fkey" FOREIGN KEY ("balitaId") REFERENCES "public"."Balita"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PemeriksaanBalita" ADD CONSTRAINT "PemeriksaanBalita_kegiatanId_fkey" FOREIGN KEY ("kegiatanId") REFERENCES "public"."Kegiatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PemeriksaanBalita" ADD CONSTRAINT "PemeriksaanBalita_kaderId_fkey" FOREIGN KEY ("kaderId") REFERENCES "public"."Kader"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PemeriksaanIbuHamil" ADD CONSTRAINT "PemeriksaanIbuHamil_ibuHamilId_fkey" FOREIGN KEY ("ibuHamilId") REFERENCES "public"."IbuHamil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PemeriksaanIbuHamil" ADD CONSTRAINT "PemeriksaanIbuHamil_kegiatanId_fkey" FOREIGN KEY ("kegiatanId") REFERENCES "public"."Kegiatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PemeriksaanIbuHamil" ADD CONSTRAINT "PemeriksaanIbuHamil_kaderId_fkey" FOREIGN KEY ("kaderId") REFERENCES "public"."Kader"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StatusGiziBalita" ADD CONSTRAINT "StatusGiziBalita_balitaId_fkey" FOREIGN KEY ("balitaId") REFERENCES "public"."Balita"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
