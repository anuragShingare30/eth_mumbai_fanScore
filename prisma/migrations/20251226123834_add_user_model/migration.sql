-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "twitterHandle" TEXT NOT NULL,
    "displayName" TEXT,
    "profileImageUrl" TEXT,
    "tweetCount" INTEGER NOT NULL DEFAULT 0,
    "ethMumbaiScore" INTEGER NOT NULL DEFAULT 0,
    "rank" TEXT NOT NULL DEFAULT 'Newbie',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_twitterHandle_key" ON "User"("twitterHandle");

-- CreateIndex
CREATE INDEX "User_ethMumbaiScore_idx" ON "User"("ethMumbaiScore" DESC);
