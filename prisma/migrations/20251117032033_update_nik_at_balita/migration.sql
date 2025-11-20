/*
  Warnings:

  - Made the column `nik` on table `Balita` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Balita" ALTER COLUMN "nik" SET NOT NULL,
ALTER COLUMN "noKK" DROP NOT NULL;
