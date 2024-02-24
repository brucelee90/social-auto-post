/*
  Warnings:

  - The primary key for the `MediaQueue` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `productId` on the `MediaQueue` table. The data in that column could be lost. The data in that column will be cast from `String` to `BigInt`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MediaQueue" (
    "productId" BIGINT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL
);
INSERT INTO "new_MediaQueue" ("productId", "shopId") SELECT "productId", "shopId" FROM "MediaQueue";
DROP TABLE "MediaQueue";
ALTER TABLE "new_MediaQueue" RENAME TO "MediaQueue";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
