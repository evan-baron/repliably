/*
  Warnings:

  - The values [pendings] on the enum `MessageStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- Create a corrected enum, add new columns (including status using the new enum),
-- then replace the old enum type.
BEGIN;

-- Create the corrected enum type
CREATE TYPE "MessageStatus_new" AS ENUM ('scheduled', 'pending', 'sent', 'failed');

-- Add new columns (including status using the new enum)
ALTER TABLE "Message" ADD COLUMN "lastError" TEXT,
    ADD COLUMN "scheduledAt" TIMESTAMP(3),
    ADD COLUMN "sendAttempts" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "sentAt" TIMESTAMP(3),
    ADD COLUMN "status" "MessageStatus_new" NOT NULL DEFAULT 'scheduled';

-- Replace the old enum type with the new one
ALTER TYPE "MessageStatus" RENAME TO "MessageStatus_old";
ALTER TYPE "MessageStatus_new" RENAME TO "MessageStatus";
DROP TYPE IF EXISTS "public"."MessageStatus_old";

COMMIT;

-- Create index for efficient worker queries
CREATE INDEX IF NOT EXISTS "Message_status_scheduledAt_idx" ON "Message"("status", "scheduledAt");
