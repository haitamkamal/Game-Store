-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "name" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "games" ALTER COLUMN "image" DROP NOT NULL;
