-- Product listing fields for weaver catalog entries.
-- Additive only: every new column is nullable or has a default, so existing
-- rows remain valid without a backfill.

ALTER TYPE "ProductStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';

DO $$ BEGIN
  CREATE TYPE "StockType" AS ENUM ('ready_stock', 'made_to_order');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "subcategory" TEXT,
  ADD COLUMN IF NOT EXISTS "primaryColor" TEXT,
  ADD COLUMN IF NOT EXISTS "secondaryColor" TEXT,
  ADD COLUMN IF NOT EXISTS "lengthMeters" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "widthMeters" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "weightGrams" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "basePrice" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS "minOrderQuantity" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "stockType" "StockType" NOT NULL DEFAULT 'ready_stock',
  ADD COLUMN IF NOT EXISTS "productionLeadTimeDays" INTEGER,
  ADD COLUMN IF NOT EXISTS "maxOrderCapacity" INTEGER,
  ADD COLUMN IF NOT EXISTS "isHandloom" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "giTag" TEXT,
  ADD COLUMN IF NOT EXISTS "certificationDetails" TEXT,
  ADD COLUMN IF NOT EXISTS "careInstructions" TEXT,
  ADD COLUMN IF NOT EXISTS "targetAudience" TEXT,
  ADD COLUMN IF NOT EXISTS "usageContext" TEXT;
