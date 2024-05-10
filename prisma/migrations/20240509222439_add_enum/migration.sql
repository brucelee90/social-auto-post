/*
  Warnings:

  - You are about to alter the column `scheduleStatus` on the `PostScheduleQueue` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `PostScheduleQueue` MODIFY `scheduleStatus` ENUM('Draft', 'Scheduled', 'Posted') NOT NULL;
