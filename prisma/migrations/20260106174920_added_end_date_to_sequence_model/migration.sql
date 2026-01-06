-- AlterTable
ALTER TABLE "Sequence" ADD COLUMN     "endDate" TIMESTAMP(3),
ALTER COLUMN "autoSendDuration" SET DEFAULT 30;
