/*
  Warnings:

  - You are about to drop the column `customPlaceholderId` on the `CustomPlaceholder` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CustomPlaceholder" (
    "customPlaceholderName" TEXT NOT NULL DEFAULT '',
    "customPlaceholderContent" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,

    PRIMARY KEY ("customPlaceholderName", "settingsId"),
    CONSTRAINT "CustomPlaceholder_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CustomPlaceholder" ("customPlaceholderContent", "customPlaceholderName", "settingsId") SELECT "customPlaceholderContent", "customPlaceholderName", "settingsId" FROM "CustomPlaceholder";
DROP TABLE "CustomPlaceholder";
ALTER TABLE "new_CustomPlaceholder" RENAME TO "CustomPlaceholder";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
