/*
  Warnings:

  - You are about to drop the column `facebookAccessToken` on the `PostScheduleQueue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `PostScheduleQueue` DROP COLUMN `facebookAccessToken`;

-- AlterTable
ALTER TABLE `Session` ADD COLUMN `facebookAccessToken` VARCHAR(191) NOT NULL DEFAULT '';
