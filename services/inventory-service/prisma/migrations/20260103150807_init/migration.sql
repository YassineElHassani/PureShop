-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('INBOUND', 'OUTBOUND', 'RESERVED', 'RELEASED', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "stocks" (
    "id" TEXT NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "type" "MovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" VARCHAR(255) NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stocks_sku_key" ON "stocks"("sku");

-- CreateIndex
CREATE INDEX "stocks_sku_idx" ON "stocks"("sku");

-- CreateIndex
CREATE INDEX "stock_movements_sku_idx" ON "stock_movements"("sku");

-- CreateIndex
CREATE INDEX "stock_movements_type_idx" ON "stock_movements"("type");
