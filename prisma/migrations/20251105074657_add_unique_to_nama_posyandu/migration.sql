/*
  Warnings:

  - A unique constraint covering the columns `[nama]` on the table `Posyandu` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Posyandu_nama_key" ON "public"."Posyandu"("nama");
