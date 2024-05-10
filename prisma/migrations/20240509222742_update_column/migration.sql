/*
  Warnings:

  - The values [Draft,Scheduled,Posted] on the enum `PostScheduleQueue_scheduleStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `PostScheduleQueue` MODIFY `scheduleStatus` ENUM('draft', 'scheduled', 'posted') NOT NULL;
