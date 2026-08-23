-- AlterEnum
ALTER TYPE "AccountType" ADD VALUE 'cash';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "vendorId" TEXT;

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "matchText" TEXT NOT NULL,
    "matchType" "VendorMatchType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_rules" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "source" "VendorRuleSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_homes" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "transaction_homes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_person_tags" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "personTagId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "transaction_person_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vendors_householdId_idx" ON "vendors"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "category_rules_vendorId_key" ON "category_rules"("vendorId");

-- CreateIndex
CREATE INDEX "category_rules_householdId_idx" ON "category_rules"("householdId");

-- CreateIndex
CREATE INDEX "transaction_homes_homeId_idx" ON "transaction_homes"("homeId");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_homes_transactionId_homeId_key" ON "transaction_homes"("transactionId", "homeId");

-- CreateIndex
CREATE INDEX "transaction_person_tags_personTagId_idx" ON "transaction_person_tags"("personTagId");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_person_tags_transactionId_personTagId_key" ON "transaction_person_tags"("transactionId", "personTagId");

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_rules" ADD CONSTRAINT "category_rules_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_rules" ADD CONSTRAINT "category_rules_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_rules" ADD CONSTRAINT "category_rules_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_homes" ADD CONSTRAINT "transaction_homes_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_homes" ADD CONSTRAINT "transaction_homes_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "homes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_person_tags" ADD CONSTRAINT "transaction_person_tags_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_person_tags" ADD CONSTRAINT "transaction_person_tags_personTagId_fkey" FOREIGN KEY ("personTagId") REFERENCES "person_tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
