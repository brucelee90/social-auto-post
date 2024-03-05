/*
  Warnings:

  - Added the required column `postDescription` to the `PostScheduleQueue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postImgUrl` to the `PostScheduleQueue` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PostScheduleQueue" (
    "productId" BIGINT NOT NULL PRIMARY KEY,
    "dateScheduled" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postImgUrl" TEXT NOT NULL,
    "postDescription" TEXT NOT NULL
);
INSERT INTO "new_PostScheduleQueue" ("dateScheduled", "productId") SELECT "dateScheduled", "productId" FROM "PostScheduleQueue";
DROP TABLE "PostScheduleQueue";
ALTER TABLE "new_PostScheduleQueue" RENAME TO "PostScheduleQueue";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
