-- CreateTable
CREATE TABLE `InstagramQueue` (
    `id` INTEGER NOT NULL,
    `postImgUrl` VARCHAR(191) NOT NULL,
    `postDescription` VARCHAR(191) NOT NULL,
    `postScheduleQueueProductId` BIGINT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InstagramQueue` ADD CONSTRAINT `InstagramQueue_postScheduleQueueProductId_fkey` FOREIGN KEY (`postScheduleQueueProductId`) REFERENCES `PostScheduleQueue`(`productId`) ON DELETE SET NULL ON UPDATE CASCADE;
