/*
  Warnings:

  - Added the required column `shopName` to the `PostScheduleQueue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PostScheduleQueue` ADD COLUMN `shopName` VARCHAR(191) NOT NULL;
