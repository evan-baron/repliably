/*
  Warnings:

  - You are about to drop the column `autoSendDuration` on the `Sequence` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Sequence" DROP COLUMN "autoSendDuration",
ADD COLUMN     "sequenceDuration" INTEGER DEFAULT 30;
