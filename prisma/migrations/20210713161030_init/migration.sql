-- CreateTable
CREATE TABLE "Snipes" (
    "id" INTEGER NOT NULL,
    "author" TEXT NOT NULL DEFAULT E'Placeholder Author',
    "content" TEXT NOT NULL DEFAULT E'Placeholder Content',

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditSnipes" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "author" TEXT NOT NULL DEFAULT E'Placeholder Author',
    "content" TEXT NOT NULL DEFAULT E'Placeholder Content',

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verses" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT E'Placeholder Title',
    "content" TEXT NOT NULL DEFAULT E'Placeholder Content',

    PRIMARY KEY ("id")
);
