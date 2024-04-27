/*
  Warnings:

  - The primary key for the `Settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Settings` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `settingsId` on the `CustomPlaceholder` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "isCustomDescription" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Settings" ("id", "isCustomDescription") SELECT "id", "isCustomDescription" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
CREATE TABLE "new_CustomPlaceholder" (
    "customPlaceholderId" TEXT NOT NULL PRIMARY KEY,
    "customPlaceholderContent" TEXT NOT NULL,
    "settingsId" INTEGER,
    CONSTRAINT "CustomPlaceholder_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CustomPlaceholder" ("customPlaceholderContent", "customPlaceholderId", "settingsId") SELECT "customPlaceholderContent", "customPlaceholderId", "settingsId" FROM "CustomPlaceholder";
DROP TABLE "CustomPlaceholder";
ALTER TABLE "new_CustomPlaceholder" RENAME TO "CustomPlaceholder";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
