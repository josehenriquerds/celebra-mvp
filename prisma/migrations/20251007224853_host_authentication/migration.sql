/*
  Warnings:

  - A unique constraint covering the columns `[primary_offer_id]` on the table `gift_registry_items` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "gift_contributions" DROP CONSTRAINT "gift_contributions_purchase_id_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "gift_registry_items_primary_offer_id_key" ON "gift_registry_items"("primary_offer_id");

-- AddForeignKey
ALTER TABLE "gift_contributions" ADD CONSTRAINT "gift_contributions_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "gift_purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
