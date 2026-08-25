-- AlterTable
ALTER TABLE "invites" ADD COLUMN     "personTagId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "person_tags" DROP COLUMN "isOwner",
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "invites_personTagId_idx" ON "invites"("personTagId");

-- CreateIndex
CREATE UNIQUE INDEX "person_tags_userId_key" ON "person_tags"("userId");

-- AddForeignKey
ALTER TABLE "person_tags" ADD CONSTRAINT "person_tags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_personTagId_fkey" FOREIGN KEY ("personTagId") REFERENCES "person_tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

