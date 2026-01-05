-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'CANCELED');

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "orderId" VARCHAR(255) NOT NULL,
    "stripeSessionId" VARCHAR(255) NOT NULL,
    "paymentIntentId" VARCHAR(255),
    "customerId" VARCHAR(255) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" VARCHAR(100),
    "receiptEmail" VARCHAR(255),
    "receiptUrl" TEXT,
    "failureReason" TEXT,
    "failureCode" VARCHAR(100),
    "idempotencyKey" VARCHAR(255),
    "metadata" TEXT,
    "chargeId" VARCHAR(255),
    "refundedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_logs" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    "stripeEventId" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL,
    "statusCode" INTEGER,
    "message" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_idempotency" (
    "id" TEXT NOT NULL,
    "idempotencyKey" VARCHAR(255) NOT NULL,
    "orderId" VARCHAR(255) NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_idempotency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_orderId_key" ON "payments"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripeSessionId_key" ON "payments"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentIntentId_key" ON "payments"("paymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_idempotencyKey_key" ON "payments"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "payments_chargeId_key" ON "payments"("chargeId");

-- CreateIndex
CREATE INDEX "payments_orderId_idx" ON "payments"("orderId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_customerId_idx" ON "payments"("customerId");

-- CreateIndex
CREATE INDEX "payments_createdAt_idx" ON "payments"("createdAt");

-- CreateIndex
CREATE INDEX "payment_logs_paymentId_idx" ON "payment_logs"("paymentId");

-- CreateIndex
CREATE INDEX "payment_logs_eventType_idx" ON "payment_logs"("eventType");

-- CreateIndex
CREATE INDEX "payment_logs_createdAt_idx" ON "payment_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "payment_idempotency_idempotencyKey_key" ON "payment_idempotency"("idempotencyKey");

-- CreateIndex
CREATE INDEX "payment_idempotency_orderId_idx" ON "payment_idempotency"("orderId");

-- AddForeignKey
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
