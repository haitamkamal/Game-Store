/*
  Warnings:

  - You are about to drop the column `password` on the `Membership` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_authorId_fkey";

-- DropIndex
DROP INDEX "Membership_password_key";

-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "password",
ADD COLUMN     "passwordd" TEXT NOT NULL DEFAULT 'admin123';

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
