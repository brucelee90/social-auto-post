/*
  Warnings:

  - You are about to drop the column `shop` on the `MediaQueue` table. All the data in the column will be lost.
  - Added the required column `shopId` to the `MediaQueue` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MediaQueue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopId" TEXT NOT NULL,
    "productId" TEXT NOT NULL
);
INSERT INTO "new_MediaQueue" ("id", "productId") SELECT "id", "productId" FROM "MediaQueue";
DROP TABLE "MediaQueue";
ALTER TABLE "new_MediaQueue" RENAME TO "MediaQueue";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
