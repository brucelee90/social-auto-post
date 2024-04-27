-- CreateTable
CREATE TABLE "CustomPlaceholder" (
    "customPlaceholderId" TEXT NOT NULL PRIMARY KEY,
    "customPlaceholderContent" TEXT NOT NULL,
    "settingsId" TEXT,
    CONSTRAINT "CustomPlaceholder_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
