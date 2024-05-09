/*
  Warnings:

  - You are about to drop the column `shopName` on the `PostScheduleQueue` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `PostScheduleQueue_shopName_fkey` ON `PostScheduleQueue`;

-- AlterTable
ALTER TABLE `PostScheduleQueue` DROP COLUMN `shopName`;
