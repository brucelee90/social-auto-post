/*
  Warnings:

  - Added the required column `scheduleStatus` to the `PostScheduleQueue` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "settingsId" TEXT,
    CONSTRAINT "Session_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("accessToken", "expires", "id", "isOnline", "scope", "shop", "state", "userId") SELECT "accessToken", "expires", "id", "isOnline", "scope", "shop", "state", "userId" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE UNIQUE INDEX "Session_settingsId_key" ON "Session"("settingsId");
CREATE TABLE "new_PostScheduleQueue" (
    "productId" BIGINT NOT NULL PRIMARY KEY,
    "dateScheduled" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postImgUrl" TEXT NOT NULL,
    "postDescription" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "scheduleStatus" TEXT NOT NULL,
    CONSTRAINT "PostScheduleQueue_shopName_fkey" FOREIGN KEY ("shopName") REFERENCES "Session" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PostScheduleQueue" ("dateScheduled", "postDescription", "postImgUrl", "productId", "shopName") SELECT "dateScheduled", "postDescription", "postImgUrl", "productId", "shopName" FROM "PostScheduleQueue";
DROP TABLE "PostScheduleQueue";
ALTER TABLE "new_PostScheduleQueue" RENAME TO "PostScheduleQueue";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
