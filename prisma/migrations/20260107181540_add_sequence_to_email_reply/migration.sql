/*
  Warnings:

  - Added the required column `threadId` to the `EmailReply` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailReply" ADD COLUMN     "sequenceId" INTEGER,
ADD COLUMN     "threadId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "EmailReply" ADD CONSTRAINT "EmailReply_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "Sequence"("id") ON DELETE SET NULL ON UPDATE CASCADE;
