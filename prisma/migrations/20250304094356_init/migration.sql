/*
  Warnings:

  - Made the column `image` on table `games` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "games" ALTER COLUMN "image" SET NOT NULL,
ALTER COLUMN "image" DROP DEFAULT;
