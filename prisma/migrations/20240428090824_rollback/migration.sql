/*
  Warnings:

  - You are about to drop the column `campaignCampaignId` on the `PostScheduleQueue` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PostScheduleQueue" (
    "productId" BIGINT NOT NULL PRIMARY KEY,
    "dateScheduled" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postImgUrl" TEXT NOT NULL,
    "postDescription" TEXT NOT NULL
);
INSERT INTO "new_PostScheduleQueue" ("dateScheduled", "postDescription", "postImgUrl", "productId") SELECT "dateScheduled", "postDescription", "postImgUrl", "productId" FROM "PostScheduleQueue";
DROP TABLE "PostScheduleQueue";
ALTER TABLE "new_PostScheduleQueue" RENAME TO "PostScheduleQueue";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
