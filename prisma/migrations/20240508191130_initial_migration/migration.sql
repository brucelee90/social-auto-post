-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `isOnline` BOOLEAN NOT NULL DEFAULT false,
    `scope` VARCHAR(191) NULL,
    `expires` DATETIME(3) NULL,
    `accessToken` VARCHAR(191) NOT NULL,
    `userId` BIGINT NULL,
    `settingsId` VARCHAR(191) NULL,

    UNIQUE INDEX `Session_settingsId_key`(`settingsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaQueue` (
    `productId` BIGINT NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PostScheduleQueue` (
    `productId` BIGINT NOT NULL,
    `dateScheduled` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `postImgUrl` VARCHAR(191) NOT NULL,
    `postDescription` VARCHAR(191) NOT NULL,
    `shopName` VARCHAR(191) NOT NULL,
    `scheduleStatus` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Campaign` (
    `campaignId` INTEGER NOT NULL AUTO_INCREMENT,
    `campaignName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`campaignId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Settings` (
    `id` VARCHAR(191) NOT NULL,
    `isCustomDescription` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomPlaceholder` (
    `customPlaceholderName` VARCHAR(191) NOT NULL DEFAULT '',
    `customPlaceholderContent` VARCHAR(191) NOT NULL,
    `settingsId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`customPlaceholderName`, `settingsId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DefaultCaption` (
    `defaultCaptionName` VARCHAR(191) NOT NULL DEFAULT '',
    `defaultCaptionContent` VARCHAR(191) NOT NULL,
    `settingsId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`defaultCaptionName`, `settingsId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_settingsId_fkey` FOREIGN KEY (`settingsId`) REFERENCES `Settings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostScheduleQueue` ADD CONSTRAINT `PostScheduleQueue_shopName_fkey` FOREIGN KEY (`shopName`) REFERENCES `Session`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomPlaceholder` ADD CONSTRAINT `CustomPlaceholder_settingsId_fkey` FOREIGN KEY (`settingsId`) REFERENCES `Settings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DefaultCaption` ADD CONSTRAINT `DefaultCaption_settingsId_fkey` FOREIGN KEY (`settingsId`) REFERENCES `Settings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
