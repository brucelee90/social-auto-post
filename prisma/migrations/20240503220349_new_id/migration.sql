/*
  Warnings:

  - The primary key for the `CustomPlaceholder` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `settingsId` on table `CustomPlaceholder` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CustomPlaceholder" (
    "customPlaceholderId" TEXT NOT NULL,
    "customPlaceholderName" TEXT NOT NULL DEFAULT '',
    "customPlaceholderContent" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,

    PRIMARY KEY ("customPlaceholderName", "settingsId"),
    CONSTRAINT "CustomPlaceholder_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CustomPlaceholder" ("customPlaceholderContent", "customPlaceholderId", "customPlaceholderName", "settingsId") SELECT "customPlaceholderContent", "customPlaceholderId", "customPlaceholderName", "settingsId" FROM "CustomPlaceholder";
DROP TABLE "CustomPlaceholder";
ALTER TABLE "new_CustomPlaceholder" RENAME TO "CustomPlaceholder";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
