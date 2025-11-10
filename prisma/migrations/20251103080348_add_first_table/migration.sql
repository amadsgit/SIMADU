-- CreateEnum
CREATE TYPE "public"."Akreditasi" AS ENUM ('PARIPURNA', 'PRATAMA', 'MADYA', 'PURNAMA', 'MANDIRI', 'BELUM_AKREDITASI');

-- CreateTable
CREATE TABLE "public"."Kelurahan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kelurahan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Posyandu" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "wilayah" TEXT NOT NULL,
    "kelurahanId" INTEGER,
    "penanggungJawab" TEXT NOT NULL,
    "noHp" TEXT NOT NULL,
    "akreditasi" "public"."Akreditasi" NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Posyandu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Kader" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "noHp" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "posyanduId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Role" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "noHp" TEXT NOT NULL,
    "noKK" TEXT,
    "nik" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "alamat" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "resetToken" TEXT,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Otp" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Klaster" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Klaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProgramKesehatan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "klasterId" INTEGER NOT NULL,
    "roleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramKesehatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Kegiatan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "tanggalPelaksanaan" TIMESTAMP(3),
    "alamat" TEXT,
    "posyanduId" INTEGER NOT NULL,
    "programKesehatanId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kelurahan_nama_key" ON "public"."Kelurahan"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Kader_nik_key" ON "public"."Kader"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "Role_nama_key" ON "public"."Role"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Role_slug_key" ON "public"."Role"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_nik_key" ON "public"."User"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "Klaster_nama_key" ON "public"."Klaster"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramKesehatan_roleId_key" ON "public"."ProgramKesehatan"("roleId");

-- CreateIndex
CREATE INDEX "Kegiatan_posyanduId_idx" ON "public"."Kegiatan"("posyanduId");

-- CreateIndex
CREATE INDEX "Kegiatan_programKesehatanId_idx" ON "public"."Kegiatan"("programKesehatanId");

-- AddForeignKey
ALTER TABLE "public"."Posyandu" ADD CONSTRAINT "Posyandu_kelurahanId_fkey" FOREIGN KEY ("kelurahanId") REFERENCES "public"."Kelurahan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Kader" ADD CONSTRAINT "Kader_posyanduId_fkey" FOREIGN KEY ("posyanduId") REFERENCES "public"."Posyandu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Otp" ADD CONSTRAINT "Otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProgramKesehatan" ADD CONSTRAINT "ProgramKesehatan_klasterId_fkey" FOREIGN KEY ("klasterId") REFERENCES "public"."Klaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProgramKesehatan" ADD CONSTRAINT "ProgramKesehatan_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Kegiatan" ADD CONSTRAINT "Kegiatan_posyanduId_fkey" FOREIGN KEY ("posyanduId") REFERENCES "public"."Posyandu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Kegiatan" ADD CONSTRAINT "Kegiatan_programKesehatanId_fkey" FOREIGN KEY ("programKesehatanId") REFERENCES "public"."ProgramKesehatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
