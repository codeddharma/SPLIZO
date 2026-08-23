-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_homeId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_personTagId_fkey";

-- DropForeignKey
ALTER TABLE "vendor_rules" DROP CONSTRAINT "vendor_rules_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "vendor_rules" DROP CONSTRAINT "vendor_rules_householdId_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "homeId",
DROP COLUMN "personTagId";

-- DropTable
DROP TABLE "vendor_rules";
