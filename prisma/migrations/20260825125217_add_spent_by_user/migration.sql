-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "spentByUserId" TEXT;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_spentByUserId_fkey" FOREIGN KEY ("spentByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
