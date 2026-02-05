-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gmailConnected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gmailConnectedAt" TIMESTAMP(3),
ADD COLUMN     "googleAccessToken" TEXT,
ADD COLUMN     "googleEmail" TEXT,
ADD COLUMN     "googleRefreshToken" TEXT,
ADD COLUMN     "googleTokenExpiry" TIMESTAMP(3);
