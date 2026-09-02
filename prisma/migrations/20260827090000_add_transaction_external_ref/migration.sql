-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "externalRef" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "transactions_householdId_externalRef_key" ON "transactions"("householdId", "externalRef");

