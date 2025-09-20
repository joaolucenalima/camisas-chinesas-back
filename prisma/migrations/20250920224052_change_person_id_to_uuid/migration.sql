/*
  Warnings:

  - The primary key for the `Person` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Person" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT
);
INSERT INTO "new_Person" ("id", "name") SELECT "id", "name" FROM "Person";
DROP TABLE "Person";
ALTER TABLE "new_Person" RENAME TO "Person";
CREATE TABLE "new_Shirt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "link" TEXT,
    "imageURL" TEXT NOT NULL,
    "priceInCents" INTEGER,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "status" INTEGER NOT NULL DEFAULT 1,
    "personId" TEXT NOT NULL,
    CONSTRAINT "Shirt_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Shirt" ("enabled", "id", "imageURL", "link", "personId", "priceInCents", "status", "title") SELECT "enabled", "id", "imageURL", "link", "personId", "priceInCents", "status", "title" FROM "Shirt";
DROP TABLE "Shirt";
ALTER TABLE "new_Shirt" RENAME TO "Shirt";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
