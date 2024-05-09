-- DropForeignKey
ALTER TABLE `PostScheduleQueue` DROP FOREIGN KEY `PostScheduleQueue_shopName_fkey`;

-- AlterTable
ALTER TABLE `PostScheduleQueue` ADD COLUMN `sessionId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `PostScheduleQueue` ADD CONSTRAINT `PostScheduleQueue_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `Session`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
