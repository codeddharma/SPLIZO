-- AlterTable
ALTER TABLE "users" ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3);

-- Backfill existing rows (created before this consent gate existed) with
-- their original creation time, so the column can become NOT NULL below.
UPDATE "users" SET "termsAcceptedAt" = "createdAt" WHERE "termsAcceptedAt" IS NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "termsAcceptedAt" SET NOT NULL;
