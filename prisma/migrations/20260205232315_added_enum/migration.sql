/*
  Warnings:

  - The `subscriptionTier` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('free', 'basic', 'premium', 'unlimited');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "subscriptionTier",
ADD COLUMN     "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'free';
