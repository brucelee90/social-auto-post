-- AlterTable
ALTER TABLE `PostScheduleQueue` ADD COLUMN `platform` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `postDetails` JSON NOT NULL;
