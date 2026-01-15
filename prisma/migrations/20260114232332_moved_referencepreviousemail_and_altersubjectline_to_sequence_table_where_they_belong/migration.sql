/*
  Warnings:

  - You are about to drop the column `alterSubjectLine` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `referencePreviousEmail` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "alterSubjectLine",
DROP COLUMN "referencePreviousEmail";

-- AlterTable
ALTER TABLE "Sequence" ADD COLUMN     "alterSubjectLine" BOOLEAN,
ADD COLUMN     "referencePreviousEmail" BOOLEAN;
