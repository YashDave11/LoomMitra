-- Auction House: Auction + Bid tables. Additive only.

DO $$ BEGIN
  CREATE TYPE "AuctionStatus" AS ENUM ('DRAFT', 'UPCOMING', 'LIVE', 'ENDED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "AuctionResult" AS ENUM ('PENDING', 'WON', 'NO_SALE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Auction" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "weaverId" TEXT NOT NULL,
  "basePrice" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "startTime" TIMESTAMP(3) NOT NULL,
  "endTime" TIMESTAMP(3) NOT NULL,
  "status" "AuctionStatus" NOT NULL DEFAULT 'DRAFT',
  "minBidIncrement" DOUBLE PRECISION,
  "buyNowPrice" DOUBLE PRECISION,
  "reservedPrice" DOUBLE PRECISION,
  "maxBidsPerUser" INTEGER,
  "result" "AuctionResult" NOT NULL DEFAULT 'PENDING',
  "winningBidId" TEXT,
  "winningBidderUserId" TEXT,
  "finalPrice" DOUBLE PRECISION,
  "orderStatus" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Bid" (
  "id" TEXT NOT NULL,
  "auctionId" TEXT NOT NULL,
  "bidderUserId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Auction_winningBidId_key" ON "Auction"("winningBidId");
CREATE INDEX IF NOT EXISTS "Bid_auctionId_amount_idx" ON "Bid"("auctionId", "amount");

ALTER TABLE "Auction" ADD CONSTRAINT "Auction_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_weaverId_fkey"
  FOREIGN KEY ("weaverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_winningBidId_fkey"
  FOREIGN KEY ("winningBidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auctionId_fkey"
  FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_bidderUserId_fkey"
  FOREIGN KEY ("bidderUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
