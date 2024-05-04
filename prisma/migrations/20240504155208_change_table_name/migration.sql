/*
  Warnings:

  - You are about to drop the `InitalText` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "InitalText";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "DefaultCaption" (
    "defaultCaptionId" BIGINT NOT NULL PRIMARY KEY,
    "defaultCaptionContent" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,
    CONSTRAINT "DefaultCaption_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
