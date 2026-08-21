-- CreateEnum
CREATE TYPE "CategoryKind" AS ENUM ('income', 'expense');

-- CreateEnum
CREATE TYPE "VendorMatchType" AS ENUM ('exact', 'contains');

-- CreateEnum
CREATE TYPE "VendorRuleSource" AS ENUM ('user_defined', 'learned');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('bank', 'card', 'wallet');

-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('confirmed', 'auto_mapped', 'needs_review', 'unmapped');

-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('manual', 'csv', 'pdf');

-- CreateEnum
CREATE TYPE "LoanDirection" AS ENUM ('lent', 'borrowed');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('open', 'settled');

-- CreateTable
CREATE TABLE "households" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "households_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homes" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "homes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_tags" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "person_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "CategoryKind" NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_rules" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "matchText" TEXT NOT NULL,
    "matchType" "VendorMatchType" NOT NULL,
    "categoryId" TEXT NOT NULL,
    "source" "VendorRuleSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "institution" TEXT,
    "last4" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "categoryId" TEXT,
    "categoryStatus" "CategoryStatus" NOT NULL DEFAULT 'unmapped',
    "personTagId" TEXT,
    "homeId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "source" "TransactionSource" NOT NULL,
    "importBatchId" TEXT,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batches" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "notes" TEXT,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "direction" "LoanDirection" NOT NULL,
    "openingAmount" DECIMAL(12,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "status" "LoanStatus" NOT NULL DEFAULT 'open',
    "linkedTransactionId" TEXT,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_repayments" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "loan_repayments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_householdId_idx" ON "users"("householdId");

-- CreateIndex
CREATE INDEX "homes_householdId_idx" ON "homes"("householdId");

-- CreateIndex
CREATE INDEX "person_tags_householdId_idx" ON "person_tags"("householdId");

-- CreateIndex
CREATE INDEX "categories_householdId_idx" ON "categories"("householdId");

-- CreateIndex
CREATE INDEX "vendor_rules_householdId_idx" ON "vendor_rules"("householdId");

-- CreateIndex
CREATE INDEX "accounts_householdId_idx" ON "accounts"("householdId");

-- CreateIndex
CREATE INDEX "transactions_householdId_date_idx" ON "transactions"("householdId", "date");

-- CreateIndex
CREATE INDEX "transactions_householdId_categoryStatus_idx" ON "transactions"("householdId", "categoryStatus");

-- CreateIndex
CREATE INDEX "import_batches_householdId_idx" ON "import_batches"("householdId");

-- CreateIndex
CREATE INDEX "contacts_householdId_idx" ON "contacts"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "loans_linkedTransactionId_key" ON "loans"("linkedTransactionId");

-- CreateIndex
CREATE INDEX "loans_householdId_idx" ON "loans"("householdId");

-- CreateIndex
CREATE INDEX "loan_repayments_loanId_idx" ON "loan_repayments"("loanId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homes" ADD CONSTRAINT "homes_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_tags" ADD CONSTRAINT "person_tags_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_rules" ADD CONSTRAINT "vendor_rules_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_rules" ADD CONSTRAINT "vendor_rules_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_personTagId_fkey" FOREIGN KEY ("personTagId") REFERENCES "person_tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "homes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "import_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_linkedTransactionId_fkey" FOREIGN KEY ("linkedTransactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_repayments" ADD CONSTRAINT "loan_repayments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
