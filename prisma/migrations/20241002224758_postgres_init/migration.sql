-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('draft', 'scheduled', 'posted');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "settingsId" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostScheduleQueue" (
    "productId" BIGINT NOT NULL,
    "dateScheduled" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postImgUrl" TEXT NOT NULL,
    "postDescription" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "postDetails" JSONB NOT NULL DEFAULT '{}',
    "platform" TEXT NOT NULL DEFAULT '',
    "scheduleStatus" "ScheduleStatus" NOT NULL,
    "sessionId" TEXT,

    CONSTRAINT "PostScheduleQueue_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "InstagramQueue" (
    "id" INTEGER NOT NULL,
    "postImgUrl" TEXT NOT NULL,
    "postDescription" TEXT NOT NULL,
    "postScheduleQueueProductId" BIGINT,

    CONSTRAINT "InstagramQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "facebookAccessToken" TEXT,
    "facebookPageId" TEXT DEFAULT '',

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomPlaceholder" (
    "customPlaceholderName" TEXT NOT NULL DEFAULT '',
    "customPlaceholderContent" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,

    CONSTRAINT "CustomPlaceholder_pkey" PRIMARY KEY ("customPlaceholderName","settingsId")
);

-- CreateTable
CREATE TABLE "DefaultCaption" (
    "defaultCaptionName" TEXT NOT NULL DEFAULT '',
    "defaultCaptionContent" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,

    CONSTRAINT "DefaultCaption_pkey" PRIMARY KEY ("defaultCaptionName","settingsId")
);

-- CreateTable
CREATE TABLE "MediaQueue" (
    "productId" BIGINT NOT NULL,
    "shopId" TEXT NOT NULL,

    CONSTRAINT "MediaQueue_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "campaignId" SERIAL NOT NULL,
    "campaignName" TEXT NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("campaignId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_settingsId_key" ON "Session"("settingsId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostScheduleQueue" ADD CONSTRAINT "PostScheduleQueue_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstagramQueue" ADD CONSTRAINT "InstagramQueue_postScheduleQueueProductId_fkey" FOREIGN KEY ("postScheduleQueueProductId") REFERENCES "PostScheduleQueue"("productId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomPlaceholder" ADD CONSTRAINT "CustomPlaceholder_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultCaption" ADD CONSTRAINT "DefaultCaption_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
