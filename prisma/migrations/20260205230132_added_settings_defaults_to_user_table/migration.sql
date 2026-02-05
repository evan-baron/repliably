-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultAlterSubjectLine" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "defaultReferencePrevious" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "defaultRequireApproval" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "defaultSendDelay" INTEGER,
ADD COLUMN     "defaultSequenceDuration" INTEGER,
ADD COLUMN     "defaultSequenceType" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "notificationBounce" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notificationMessageApproval" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notificationSendFailure" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notificationSequenceComplete" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "trackEmailOpens" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "trackLinkClicks" BOOLEAN NOT NULL DEFAULT true;
