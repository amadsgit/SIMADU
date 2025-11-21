-- CreateEnum
CREATE TYPE "public"."kepemilikanJKN" AS ENUM ('Belum_punya', 'JKN', 'Jamkesda', 'Jampersal');

-- CreateEnum
CREATE TYPE "public"."golDarah" AS ENUM ('Belum_diperiksa', 'A', 'AB', 'B', 'O');

-- AlterTable
ALTER TABLE "public"."IbuHamil" ADD COLUMN     "BBSH" DOUBLE PRECISION,
ADD COLUMN     "HPSuami" TEXT,
ADD COLUMN     "IMTSH" DOUBLE PRECISION,
ADD COLUMN     "RT" TEXT,
ADD COLUMN     "RW" TEXT,
ADD COLUMN     "StatusGiziKEK" DOUBLE PRECISION,
ADD COLUMN     "TBSH" DOUBLE PRECISION,
ADD COLUMN     "golonganDarah" "public"."golDarah" DEFAULT 'Belum_diperiksa',
ADD COLUMN     "kepemilikanBukuKIA" TEXT,
ADD COLUMN     "kepemilikanJKN" "public"."kepemilikanJKN" DEFAULT 'Belum_punya',
ADD COLUMN     "liLA" DOUBLE PRECISION,
ADD COLUMN     "namaSuami" TEXT,
ADD COLUMN     "noJKN" TEXT,
ALTER COLUMN "alamat" DROP NOT NULL;
