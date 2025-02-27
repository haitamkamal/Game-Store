/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "games" ALTER COLUMN "image" SET DEFAULT 'default-image-games.jpg';

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
