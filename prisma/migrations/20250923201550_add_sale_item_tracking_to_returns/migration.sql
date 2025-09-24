/*
  Warnings:

  - Added the required column `saleItemId` to the `Return` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Return" ADD COLUMN     "saleItemId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_saleItemId_fkey" FOREIGN KEY ("saleItemId") REFERENCES "SaleItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
