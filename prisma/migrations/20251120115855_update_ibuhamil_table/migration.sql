/*
  Warnings:

  - Made the column `tanggalHPHT` on table `IbuHamil` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tanggalHPL` on table `IbuHamil` required. This step will fail if there are existing NULL values in that column.
  - Made the column `BBSH` on table `IbuHamil` required. This step will fail if there are existing NULL values in that column.
  - Made the column `HPSuami` on table `IbuHamil` required. This step will fail if there are existing NULL values in that column.
  - Made the column `IMTSH` on table `IbuHamil` required. This step will fail if there are existing NULL values in that column.
  - Made the column `StatusGiziKEK` on table `IbuHamil` required. This step will fail if there are existing NULL values in that column.
  - Made the column `TBSH` on table `IbuHamil` required. This step will fail if there are existing NULL values in that column.
  - Made the column `kepemilikanBukuKIA` on table `IbuHamil` required. This step will fail if there are existing NULL values in that column.
  - Made the column `liLA` on table `IbuHamil` required. This step will fail if there are existing NULL values in that column.
  - Made the column `namaSuami` on table `IbuHamil` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."IbuHamil" ALTER COLUMN "noKK" DROP NOT NULL,
ALTER COLUMN "tanggalHPHT" SET NOT NULL,
ALTER COLUMN "tanggalHPL" SET NOT NULL,
ALTER COLUMN "BBSH" SET NOT NULL,
ALTER COLUMN "HPSuami" SET NOT NULL,
ALTER COLUMN "IMTSH" SET NOT NULL,
ALTER COLUMN "StatusGiziKEK" SET NOT NULL,
ALTER COLUMN "TBSH" SET NOT NULL,
ALTER COLUMN "kepemilikanBukuKIA" SET NOT NULL,
ALTER COLUMN "liLA" SET NOT NULL,
ALTER COLUMN "namaSuami" SET NOT NULL;
