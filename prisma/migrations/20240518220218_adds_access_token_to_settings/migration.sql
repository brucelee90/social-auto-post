/*
  Warnings:

  - You are about to drop the column `facebookAccessToken` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Session` DROP COLUMN `facebookAccessToken`;

-- AlterTable
ALTER TABLE `Settings` ADD COLUMN `facebookAccessToken` VARCHAR(191) NOT NULL DEFAULT '';
