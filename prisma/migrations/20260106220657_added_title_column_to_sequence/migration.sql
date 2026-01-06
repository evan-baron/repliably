/*
  Warnings:

  - Added the required column `title` to the `Sequence` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sequence" ADD COLUMN     "title" TEXT NOT NULL;
