-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "Shirt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "link" TEXT,
    "imageURL" TEXT,
    "priceInCents" INTEGER,
    "size" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "personId" TEXT NOT NULL,
    CONSTRAINT "Shirt_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
