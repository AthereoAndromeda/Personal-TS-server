/*
  Warnings:

  - You are about to drop the `Verses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Verses";

-- CreateTable
CREATE TABLE "Verse" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT E'Placeholder Title',
    "content" TEXT NOT NULL DEFAULT E'Placeholder Content',

    PRIMARY KEY ("id")
);
