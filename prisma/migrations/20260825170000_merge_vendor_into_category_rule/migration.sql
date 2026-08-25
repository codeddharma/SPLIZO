-- Add nullable category/source columns to the future merged table (currently "vendors")
ALTER TABLE "vendors" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "vendors" ADD COLUMN "source" "VendorRuleSource";

-- Backfill from the old vendor->category mapping table
UPDATE "vendors" v
SET "categoryId" = cr."categoryId", "source" = cr."source"
FROM "category_rules" cr
WHERE cr."vendorId" = v."id";

-- Drop the old mapping table now that its data lives on "vendors"
DROP TABLE "category_rules";

-- Detach and rename the transaction-side FK column
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_vendorId_fkey";
ALTER TABLE "transactions" RENAME COLUMN "vendorId" TO "categoryRuleId";

-- Rename "vendors" to "category_rules" -- it is now the single merged model
ALTER TABLE "vendors" RENAME TO "category_rules";
ALTER TABLE "category_rules" RENAME CONSTRAINT "vendors_pkey" TO "category_rules_pkey";
ALTER TABLE "category_rules" RENAME CONSTRAINT "vendors_householdId_fkey" TO "category_rules_householdId_fkey";
ALTER INDEX "vendors_householdId_idx" RENAME TO "category_rules_householdId_idx";

-- Re-add foreign keys against the new shape
ALTER TABLE "category_rules" ADD CONSTRAINT "category_rules_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_categoryRuleId_fkey" FOREIGN KEY ("categoryRuleId") REFERENCES "category_rules"("id") ON UPDATE CASCADE ON DELETE SET NULL;

-- Rename enums to match
ALTER TYPE "VendorMatchType" RENAME TO "MatchType";
ALTER TYPE "VendorRuleSource" RENAME TO "CategoryRuleSource";
