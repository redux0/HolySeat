-- CreateTable
CREATE TABLE "sacred_contexts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "rules" JSONB,
    "environment" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ctdp_chains" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "contextId" TEXT NOT NULL,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "longestSession" INTEGER NOT NULL DEFAULT 0,
    "averageDuration" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "brokenAt" DATETIME,
    CONSTRAINT "ctdp_chains_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "sacred_contexts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ctdp_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "message" TEXT,
    "duration" INTEGER,
    "metadata" JSONB,
    "chainId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ctdp_logs_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "ctdp_chains" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "auxiliary_chains" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetContextId" TEXT NOT NULL,
    "triggerTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delayMinutes" INTEGER NOT NULL DEFAULT 15,
    "deadline" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "reminder" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilledAt" DATETIME,
    "failedAt" DATETIME,
    CONSTRAINT "auxiliary_chains_targetContextId_fkey" FOREIGN KEY ("targetContextId") REFERENCES "sacred_contexts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ctdp_settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "defaultSessionDuration" INTEGER NOT NULL DEFAULT 3600,
    "defaultBreakDuration" INTEGER NOT NULL DEFAULT 300,
    "enableNotifications" BOOLEAN NOT NULL DEFAULT true,
    "enableSounds" BOOLEAN NOT NULL DEFAULT true,
    "strictRuleMode" BOOLEAN NOT NULL DEFAULT false,
    "allowRuleUpdates" BOOLEAN NOT NULL DEFAULT true,
    "theme" TEXT NOT NULL DEFAULT 'auto',
    "language" TEXT NOT NULL DEFAULT 'zh-CN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_CTDPLogTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CTDPLogTags_A_fkey" FOREIGN KEY ("A") REFERENCES "ctdp_logs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CTDPLogTags_B_fkey" FOREIGN KEY ("B") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_CTDPLogTags_AB_unique" ON "_CTDPLogTags"("A", "B");

-- CreateIndex
CREATE INDEX "_CTDPLogTags_B_index" ON "_CTDPLogTags"("B");
