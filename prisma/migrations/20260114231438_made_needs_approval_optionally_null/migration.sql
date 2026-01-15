-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "needsApproval" DROP NOT NULL,
ALTER COLUMN "needsApproval" DROP DEFAULT;
