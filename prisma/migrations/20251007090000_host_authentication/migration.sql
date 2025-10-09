-- CreateEnum
CREATE TYPE "HostRole" AS ENUM ('OWNER', 'ADMIN', 'STAFF');

-- CreateTable
CREATE TABLE "hosts" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "phone_normalized" TEXT,
    "password_hash" TEXT,
    "phone_verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hosts_on_events" (
    "host_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "role" "HostRole" NOT NULL DEFAULT 'STAFF',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hosts_on_events_pkey" PRIMARY KEY ("host_id", "event_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hosts_phone_normalized_key" ON "hosts"("phone_normalized");

-- CreateIndex
CREATE INDEX "hosts_phone_normalized_idx" ON "hosts"("phone_normalized");

-- CreateIndex
CREATE INDEX "hosts_on_events_event_id_idx" ON "hosts_on_events"("event_id");

-- AddForeignKey
ALTER TABLE "hosts_on_events" ADD CONSTRAINT "hosts_on_events_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "hosts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hosts_on_events" ADD CONSTRAINT "hosts_on_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill normalized phones for existing data (best-effort)
DO $$
DECLARE
  conflict_value TEXT;
BEGIN
  UPDATE "hosts"
  SET "phone_normalized" = CASE
    WHEN "phone" IS NULL OR length(trim("phone")) = 0 THEN NULL
    WHEN left(trim("phone"), 1) = '+' THEN regexp_replace(trim("phone"), '[^0-9+]', '', 'g')
    ELSE '+' || regexp_replace(trim("phone"), '[^0-9]', '', 'g')
  END
  WHERE "phone_normalized" IS NULL;

  SELECT hn.phone_normalized
    INTO conflict_value
  FROM (
    SELECT "phone_normalized", COUNT(*) AS occurrences
    FROM "hosts"
    WHERE "phone_normalized" IS NOT NULL
    GROUP BY "phone_normalized"
    HAVING COUNT(*) > 1
    LIMIT 1
  ) AS hn;

  IF conflict_value IS NOT NULL THEN
    RAISE EXCEPTION 'Duplicate normalized phone detected during backfill: %', conflict_value;
  END IF;
END;
$$;
