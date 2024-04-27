/*
  Warnings:

  - The primary key for the `Settings` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CustomPlaceholder" (
    "customPlaceholderId" TEXT NOT NULL PRIMARY KEY,
    "customPlaceholderContent" TEXT NOT NULL,
    "settingsId" TEXT,
    CONSTRAINT "CustomPlaceholder_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CustomPlaceholder" ("customPlaceholderContent", "customPlaceholderId", "settingsId") SELECT "customPlaceholderContent", "customPlaceholderId", "settingsId" FROM "CustomPlaceholder";
DROP TABLE "CustomPlaceholder";
ALTER TABLE "new_CustomPlaceholder" RENAME TO "CustomPlaceholder";
CREATE TABLE "new_Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isCustomDescription" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Settings" ("id", "isCustomDescription") SELECT "id", "isCustomDescription" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
