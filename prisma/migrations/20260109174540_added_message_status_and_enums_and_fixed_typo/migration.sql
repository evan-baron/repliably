-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_sequenceId_fkey";

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "sequenceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "Sequence"("id") ON DELETE SET NULL ON UPDATE CASCADE;
