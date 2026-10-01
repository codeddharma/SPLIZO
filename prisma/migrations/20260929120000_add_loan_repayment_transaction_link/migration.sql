-- AlterTable
ALTER TABLE "loan_repayments" ADD COLUMN     "linkedTransactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "loan_repayments_linkedTransactionId_key" ON "loan_repayments"("linkedTransactionId");

-- AddForeignKey
ALTER TABLE "loan_repayments" ADD CONSTRAINT "loan_repayments_linkedTransactionId_fkey" FOREIGN KEY ("linkedTransactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
