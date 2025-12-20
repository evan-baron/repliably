/*
  Warnings:

  - Added the required column `replySubject` to the `EmailReply` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailReply" ADD COLUMN     "replySubject" TEXT NOT NULL;
