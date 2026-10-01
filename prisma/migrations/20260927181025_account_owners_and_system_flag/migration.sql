/*
  Warnings:

  - You are about to drop the column `ownerPersonTagId` on the `accounts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_ownerPersonTagId_fkey";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "ownerPersonTagId",
ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "account_owners" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "personTagId" TEXT NOT NULL,

    CONSTRAINT "account_owners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "account_owners_personTagId_idx" ON "account_owners"("personTagId");

-- CreateIndex
CREATE UNIQUE INDEX "account_owners_accountId_personTagId_key" ON "account_owners"("accountId", "personTagId");

-- AddForeignKey
ALTER TABLE "account_owners" ADD CONSTRAINT "account_owners_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_owners" ADD CONSTRAINT "account_owners_personTagId_fkey" FOREIGN KEY ("personTagId") REFERENCES "person_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
