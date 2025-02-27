-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" INTEGER NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "inStok" INTEGER NOT NULL,
    "categoriesId" INTEGER NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_categoriesId_fkey" FOREIGN KEY ("categoriesId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
