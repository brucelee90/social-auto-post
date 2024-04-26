/*
  Warnings:

  - The primary key for the `Campaign` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `campaignId` on the `Campaign` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `campaignCampaignId` on the `PostScheduleQueue` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `campaignName` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Campaign" (
    "campaignId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "campaignName" TEXT NOT NULL
);
INSERT INTO "new_Campaign" ("campaignId") SELECT "campaignId" FROM "Campaign";
DROP TABLE "Campaign";
ALTER TABLE "new_Campaign" RENAME TO "Campaign";
CREATE TABLE "new_PostScheduleQueue" (
    "productId" BIGINT NOT NULL PRIMARY KEY,
    "dateScheduled" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postImgUrl" TEXT NOT NULL,
    "postDescription" TEXT NOT NULL,
    "campaignCampaignId" INTEGER,
    CONSTRAINT "PostScheduleQueue_campaignCampaignId_fkey" FOREIGN KEY ("campaignCampaignId") REFERENCES "Campaign" ("campaignId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PostScheduleQueue" ("campaignCampaignId", "dateScheduled", "postDescription", "postImgUrl", "productId") SELECT "campaignCampaignId", "dateScheduled", "postDescription", "postImgUrl", "productId" FROM "PostScheduleQueue";
DROP TABLE "PostScheduleQueue";
ALTER TABLE "new_PostScheduleQueue" RENAME TO "PostScheduleQueue";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
