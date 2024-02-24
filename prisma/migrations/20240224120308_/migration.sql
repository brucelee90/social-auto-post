/*
  Warnings:

  - The primary key for the `MediaQueue` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MediaQueue" (
    "productId" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL
);
INSERT INTO "new_MediaQueue" ("productId", "shopId") SELECT "productId", "shopId" FROM "MediaQueue";
DROP TABLE "MediaQueue";
ALTER TABLE "new_MediaQueue" RENAME TO "MediaQueue";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
