-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "ownerPersonTagId" TEXT;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_ownerPersonTagId_fkey" FOREIGN KEY ("ownerPersonTagId") REFERENCES "person_tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;
