-- CreateTable
CREATE TABLE "InitalText" (
    "initialTextId" BIGINT NOT NULL PRIMARY KEY,
    "initialTextContent" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,
    CONSTRAINT "InitalText_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
