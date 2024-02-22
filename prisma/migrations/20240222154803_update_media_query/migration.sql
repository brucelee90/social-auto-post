/*
  Warnings:

  - The primary key for the `MediaQueue` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `MediaId` on the `MediaQueue` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `MediaQueue` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `productId` to the `MediaQueue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop` to the `MediaQueue` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MediaQueue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL
);
INSERT INTO "new_MediaQueue" ("id") SELECT "id" FROM "MediaQueue";
DROP TABLE "MediaQueue";
ALTER TABLE "new_MediaQueue" RENAME TO "MediaQueue";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
