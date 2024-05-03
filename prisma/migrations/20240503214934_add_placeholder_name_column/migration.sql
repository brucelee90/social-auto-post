/*
  Warnings:

  - The primary key for the `CustomPlaceholder` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `customPlaceholderId` on the `CustomPlaceholder` table. The data in that column could be lost. The data in that column will be cast from `String` to `BigInt`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CustomPlaceholder" (
    "customPlaceholderId" BIGINT NOT NULL PRIMARY KEY,
    "customPlaceholderName" TEXT NOT NULL DEFAULT '',
    "customPlaceholderContent" TEXT NOT NULL,
    "settingsId" TEXT,
    CONSTRAINT "CustomPlaceholder_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CustomPlaceholder" ("customPlaceholderContent", "customPlaceholderId", "settingsId") SELECT "customPlaceholderContent", "customPlaceholderId", "settingsId" FROM "CustomPlaceholder";
DROP TABLE "CustomPlaceholder";
ALTER TABLE "new_CustomPlaceholder" RENAME TO "CustomPlaceholder";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
