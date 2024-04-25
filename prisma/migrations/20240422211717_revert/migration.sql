-- CreateTable
CREATE TABLE "Campaign" (
    "campaignId" TEXT NOT NULL PRIMARY KEY
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PostScheduleQueue" (
    "productId" BIGINT NOT NULL PRIMARY KEY,
    "dateScheduled" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postImgUrl" TEXT NOT NULL,
    "postDescription" TEXT NOT NULL,
    "campaignCampaignId" TEXT,
    CONSTRAINT "PostScheduleQueue_campaignCampaignId_fkey" FOREIGN KEY ("campaignCampaignId") REFERENCES "Campaign" ("campaignId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PostScheduleQueue" ("dateScheduled", "postDescription", "postImgUrl", "productId") SELECT "dateScheduled", "postDescription", "postImgUrl", "productId" FROM "PostScheduleQueue";
DROP TABLE "PostScheduleQueue";
ALTER TABLE "new_PostScheduleQueue" RENAME TO "PostScheduleQueue";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
