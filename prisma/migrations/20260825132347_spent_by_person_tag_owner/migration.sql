/*
  Warnings:

  - You are about to drop the column `spentByUserId` on the `transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_spentByUserId_fkey";

-- AlterTable
ALTER TABLE "person_tags" ADD COLUMN     "isOwner" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "spentByUserId",
ADD COLUMN     "spentByPersonTagId" TEXT;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_spentByPersonTagId_fkey" FOREIGN KEY ("spentByPersonTagId") REFERENCES "person_tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;
