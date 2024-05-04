/*
  Warnings:

  - The primary key for the `DefaultCaption` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `defaultCaptionId` on the `DefaultCaption` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DefaultCaption" (
    "defaultCaptionName" TEXT NOT NULL DEFAULT '',
    "defaultCaptionContent" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,

    PRIMARY KEY ("defaultCaptionName", "settingsId"),
    CONSTRAINT "DefaultCaption_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DefaultCaption" ("defaultCaptionContent", "settingsId") SELECT "defaultCaptionContent", "settingsId" FROM "DefaultCaption";
DROP TABLE "DefaultCaption";
ALTER TABLE "new_DefaultCaption" RENAME TO "DefaultCaption";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
