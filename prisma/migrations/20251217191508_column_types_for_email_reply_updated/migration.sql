/*
  Warnings:

  - Changed the type of `originalMessageId` on the `EmailReply` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `replyMessageId` on the `EmailReply` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "EmailReply" DROP COLUMN "originalMessageId",
ADD COLUMN     "originalMessageId" INTEGER NOT NULL,
DROP COLUMN "replyMessageId",
ADD COLUMN     "replyMessageId" INTEGER NOT NULL;
