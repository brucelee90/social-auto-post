/*
  Warnings:

  - Added the required column `shopName` to the `PostScheduleQueue` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PostScheduleQueue" (
    "productId" BIGINT NOT NULL PRIMARY KEY,
    "dateScheduled" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postImgUrl" TEXT NOT NULL,
    "postDescription" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    CONSTRAINT "PostScheduleQueue_shopName_fkey" FOREIGN KEY ("shopName") REFERENCES "Session" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PostScheduleQueue" ("dateScheduled", "postDescription", "postImgUrl", "productId") SELECT "dateScheduled", "postDescription", "postImgUrl", "productId" FROM "PostScheduleQueue";
DROP TABLE "PostScheduleQueue";
ALTER TABLE "new_PostScheduleQueue" RENAME TO "PostScheduleQueue";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
