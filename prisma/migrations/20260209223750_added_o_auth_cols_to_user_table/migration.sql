-- AlterTable
ALTER TABLE "User" ADD COLUMN     "connectedEmail" TEXT,
ADD COLUMN     "emailConnectedAt" TIMESTAMP(3),
ADD COLUMN     "emailConnectionActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "gmailRefreshToken" TEXT;
