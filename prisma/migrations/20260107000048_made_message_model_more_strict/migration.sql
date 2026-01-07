/*
  Warnings:

  - Made the column `ownerId` on table `Message` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sequenceId` on table `Message` required. This step will fail if there are existing NULL values in that column.
  - Made the column `subject` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_sequenceId_fkey";

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "ownerId" SET NOT NULL,
ALTER COLUMN "sequenceId" SET NOT NULL,
ALTER COLUMN "subject" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "Sequence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
