-- AlterEnum
ALTER TYPE "GiftStatus" ADD VALUE IF NOT EXISTS 'recebido';

-- AlterTable
ALTER TABLE "gift_registry_items"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "image_url" TEXT,
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'BRL',
  ADD COLUMN "category" TEXT,
  ADD COLUMN "target_quantity" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "purchased_quantity" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "allow_contributions" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "contribution_goal_cents" INTEGER,
  ADD COLUMN "contribution_raised_cents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "primary_offer_id" TEXT;

-- CreateTable
CREATE TABLE "gift_offer" (
    "id" TEXT NOT NULL,
    "gift_id" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "title" TEXT,
    "url" TEXT NOT NULL,
    "canonical_url" TEXT,
    "image_url" TEXT,
    "price_cents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "last_checked_at" TIMESTAMP(3),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "gift_offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_offer_price_history" (
    "id" TEXT NOT NULL,
    "offer_id" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gift_offer_price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_offer_click" (
    "id" TEXT NOT NULL,
    "offer_id" TEXT NOT NULL,
    "gift_id" TEXT NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,
    "clicked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gift_offer_click_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_reservations" (
    "id" TEXT NOT NULL,
    "gift_id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "reserved_until" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "gift_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_purchases" (
    "id" TEXT NOT NULL,
    "gift_id" TEXT NOT NULL,
    "guest_id" TEXT,
    "purchased_at" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "amount_paid_cents" INTEGER,
    "receipt_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "gift_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_contributions" (
    "id" TEXT NOT NULL,
    "gift_id" TEXT NOT NULL,
    "guest_id" TEXT,
    "purchase_id" TEXT,
    "amount_cents" INTEGER NOT NULL,
    "contributed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "gift_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gift_offer_url_key" ON "gift_offer"("url");

-- CreateIndex
CREATE INDEX "gift_offer_gift_id_is_primary_idx" ON "gift_offer"("gift_id", "is_primary");

-- CreateIndex
CREATE INDEX "gift_offer_price_history_offer_id_checked_at_idx" ON "gift_offer_price_history"("offer_id", "checked_at");

-- CreateIndex
CREATE INDEX "gift_offer_click_offer_id_idx" ON "gift_offer_click"("offer_id");

-- CreateIndex
CREATE INDEX "gift_offer_click_gift_id_idx" ON "gift_offer_click"("gift_id");

-- CreateIndex
CREATE INDEX "gift_registry_items_primary_offer_id_idx" ON "gift_registry_items"("primary_offer_id");

-- CreateIndex
CREATE INDEX "gift_reservations_gift_id_idx" ON "gift_reservations"("gift_id");

-- CreateIndex
CREATE INDEX "gift_reservations_guest_id_idx" ON "gift_reservations"("guest_id");

-- CreateIndex
CREATE INDEX "gift_purchases_gift_id_idx" ON "gift_purchases"("gift_id");

-- CreateIndex
CREATE INDEX "gift_purchases_guest_id_idx" ON "gift_purchases"("guest_id");

-- CreateIndex
CREATE INDEX "gift_contributions_gift_id_idx" ON "gift_contributions"("gift_id");

-- CreateIndex
CREATE INDEX "gift_contributions_guest_id_idx" ON "gift_contributions"("guest_id");

-- AddForeignKey
ALTER TABLE "gift_offer" ADD CONSTRAINT "gift_offer_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "gift_registry_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_offer_price_history" ADD CONSTRAINT "gift_offer_price_history_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "gift_offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_offer_click" ADD CONSTRAINT "gift_offer_click_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "gift_offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_offer_click" ADD CONSTRAINT "gift_offer_click_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "gift_registry_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_registry_items" ADD CONSTRAINT "gift_registry_items_primary_offer_id_fkey" FOREIGN KEY ("primary_offer_id") REFERENCES "gift_offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_reservations" ADD CONSTRAINT "gift_reservations_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "gift_registry_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_reservations" ADD CONSTRAINT "gift_reservations_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_purchases" ADD CONSTRAINT "gift_purchases_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "gift_registry_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_purchases" ADD CONSTRAINT "gift_purchases_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_contributions" ADD CONSTRAINT "gift_contributions_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "gift_registry_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_contributions" ADD CONSTRAINT "gift_contributions_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_contributions" ADD CONSTRAINT "gift_contributions_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "gift_purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
