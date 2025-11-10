/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Kader` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Kader" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Kader_userId_key" ON "public"."Kader"("userId");

-- AddForeignKey
ALTER TABLE "public"."Kader" ADD CONSTRAINT "Kader_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
