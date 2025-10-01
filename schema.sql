-- CreateEnum
CREATE TYPE "ContactRelation" AS ENUM ('familia', 'amigo', 'trabalho', 'fornecedor');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('nao_enviado', 'enviado', 'entregue', 'lido');

-- CreateEnum
CREATE TYPE "RsvpStatus" AS ENUM ('pendente', 'sim', 'nao', 'talvez');

-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('whatsapp', 'sms', 'email', 'web');

-- CreateEnum
CREATE TYPE "InteractionKind" AS ENUM ('mensagem', 'clique', 'foto', 'anexo', 'chamada');

-- CreateEnum
CREATE TYPE "EngagementTier" AS ENUM ('bronze', 'prata', 'ouro');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('system', 'host', 'bot', 'guest');

-- CreateEnum
CREATE TYPE "TimelineType" AS ENUM ('rsvp', 'msg', 'checkin', 'presente', 'tarefa');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('aberta', 'em_andamento', 'concluida', 'atrasada');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('ativo', 'inativo', 'pendente');

-- CreateEnum
CREATE TYPE "GiftStatus" AS ENUM ('disponivel', 'reservado', 'comprado');

-- CreateEnum
CREATE TYPE "ConsentSource" AS ENUM ('form', 'whatsapp', 'admin');

-- CreateEnum
CREATE TYPE "ConsentAction" AS ENUM ('opt_in', 'opt_out');

-- CreateEnum
CREATE TYPE "TableShape" AS ENUM ('round', 'square', 'rect');

-- CreateEnum
CREATE TYPE "VendorPartnerStatus" AS ENUM ('pending_review', 'approved', 'rejected', 'suspended');

-- CreateEnum
CREATE TYPE "VendorMediaType" AS ENUM ('logo', 'cover', 'gallery');

-- CreateEnum
CREATE TYPE "VendorStatusAction" AS ENUM ('submitted', 'approved', 'rejected', 'suspended', 'updated', 'reactivated');

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date_time" TIMESTAMP(3) NOT NULL,
    "venue_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "budget_total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hosts" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "relation" "ContactRelation" NOT NULL DEFAULT 'amigo',
    "notes" TEXT,
    "restrictions_json" JSONB,
    "is_vip" BOOLEAN NOT NULL DEFAULT false,
    "household_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "households" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "size_cached" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "households_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "invite_status" "InviteStatus" NOT NULL DEFAULT 'nao_enviado',
    "rsvp" "RsvpStatus" NOT NULL DEFAULT 'pendente',
    "seats" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "transport_needed" BOOLEAN NOT NULL DEFAULT false,
    "opt_out" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "segment_tags" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rule_json" JSONB NOT NULL,
    "is_dynamic" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "segment_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_tags" (
    "guest_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "guest_tags_pkey" PRIMARY KEY ("guest_id","tag_id")
);

-- CreateTable
CREATE TABLE "interactions" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "channel" "Channel" NOT NULL,
    "kind" "InteractionKind" NOT NULL,
    "payload_json" JSONB NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_scores" (
    "contact_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "tier" "EngagementTier" NOT NULL DEFAULT 'bronze',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engagement_scores_pkey" PRIMARY KEY ("contact_id","event_id")
);

-- CreateTable
CREATE TABLE "timeline_entries" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "actor_type" "ActorType" NOT NULL,
    "type" "TimelineType" NOT NULL,
    "ref_id" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meta_json" JSONB,

    CONSTRAINT "timeline_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "assignee_user_id" TEXT,
    "due_at" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'aberta',
    "sla_hours" INTEGER,
    "related_vendor_id" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "contract_value" DOUBLE PRECISION,
    "status" "VendorStatus" NOT NULL DEFAULT 'ativo',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_partners" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "slug" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_e164" TEXT NOT NULL,
    "instagram_handle" TEXT,
    "website_url" TEXT,
    "whatsapp_url" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'BR',
    "service_radius_km" INTEGER,
    "categories" TEXT[],
    "price_from_cents" INTEGER,
    "description_short" VARCHAR(280),
    "description_long" TEXT,
    "status" "VendorPartnerStatus" NOT NULL DEFAULT 'pending_review',
    "profile_score" INTEGER NOT NULL DEFAULT 0,
    "consent_text" TEXT,
    "consent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_media" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "type" "VendorMediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "blurhash" TEXT,
    "alt" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "vendor_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_reviews" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "author_contact_id" TEXT,
    "event_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_notes" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "author_user_id" TEXT NOT NULL,
    "note_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_status_log" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "action" "VendorStatusAction" NOT NULL,
    "actor_user_id" TEXT,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_status_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_registry_items" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT,
    "price" DOUBLE PRECISION,
    "status" "GiftStatus" NOT NULL DEFAULT 'disponivel',
    "buyer_contact_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_registry_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_logs" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "source" "ConsentSource" NOT NULL,
    "action" "ConsentAction" NOT NULL,
    "text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tables" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "zone" TEXT,
    "x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shape" "TableShape" NOT NULL DEFAULT 'round',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seats" (
    "id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_assignments" (
    "id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "seat_id" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "seat_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkins" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "at_gate" BOOLEAN NOT NULL DEFAULT true,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_templates" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variables" TEXT[],
    "content_text" TEXT NOT NULL,
    "content_buttons" JSONB,
    "locale" TEXT NOT NULL DEFAULT 'pt_BR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_logs" (
    "id" TEXT NOT NULL,
    "event_id" TEXT,
    "source" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contacts_phone_key" ON "contacts"("phone");

-- CreateIndex
CREATE INDEX "contacts_phone_idx" ON "contacts"("phone");

-- CreateIndex
CREATE INDEX "guests_event_id_idx" ON "guests"("event_id");

-- CreateIndex
CREATE INDEX "guests_contact_id_idx" ON "guests"("contact_id");

-- CreateIndex
CREATE INDEX "guests_rsvp_idx" ON "guests"("rsvp");

-- CreateIndex
CREATE UNIQUE INDEX "guests_event_id_contact_id_key" ON "guests"("event_id", "contact_id");

-- CreateIndex
CREATE INDEX "interactions_event_id_idx" ON "interactions"("event_id");

-- CreateIndex
CREATE INDEX "interactions_contact_id_idx" ON "interactions"("contact_id");

-- CreateIndex
CREATE INDEX "interactions_occurred_at_idx" ON "interactions"("occurred_at");

-- CreateIndex
CREATE INDEX "engagement_scores_event_id_tier_idx" ON "engagement_scores"("event_id", "tier");

-- CreateIndex
CREATE INDEX "timeline_entries_event_id_idx" ON "timeline_entries"("event_id");

-- CreateIndex
CREATE INDEX "timeline_entries_occurred_at_idx" ON "timeline_entries"("occurred_at");

-- CreateIndex
CREATE INDEX "tasks_event_id_idx" ON "tasks"("event_id");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_due_at_idx" ON "tasks"("due_at");

-- CreateIndex
CREATE INDEX "vendors_event_id_idx" ON "vendors"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_partners_slug_key" ON "vendor_partners"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_partners_email_key" ON "vendor_partners"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_partners_phone_e164_key" ON "vendor_partners"("phone_e164");

-- CreateIndex
CREATE INDEX "vendor_partners_status_idx" ON "vendor_partners"("status");

-- CreateIndex
CREATE INDEX "vendor_partners_city_state_idx" ON "vendor_partners"("city", "state");

-- CreateIndex
CREATE INDEX "vendor_partners_slug_idx" ON "vendor_partners"("slug");

-- CreateIndex
CREATE INDEX "vendor_media_vendor_id_type_idx" ON "vendor_media"("vendor_id", "type");

-- CreateIndex
CREATE INDEX "vendor_media_sort_order_idx" ON "vendor_media"("sort_order");

-- CreateIndex
CREATE INDEX "vendor_reviews_vendor_id_idx" ON "vendor_reviews"("vendor_id");

-- CreateIndex
CREATE INDEX "vendor_reviews_rating_idx" ON "vendor_reviews"("rating");

-- CreateIndex
CREATE INDEX "vendor_notes_vendor_id_idx" ON "vendor_notes"("vendor_id");

-- CreateIndex
CREATE INDEX "vendor_status_log_vendor_id_idx" ON "vendor_status_log"("vendor_id");

-- CreateIndex
CREATE INDEX "vendor_status_log_created_at_idx" ON "vendor_status_log"("created_at");

-- CreateIndex
CREATE INDEX "gift_registry_items_event_id_idx" ON "gift_registry_items"("event_id");

-- CreateIndex
CREATE INDEX "gift_registry_items_status_idx" ON "gift_registry_items"("status");

-- CreateIndex
CREATE INDEX "consent_logs_contact_id_idx" ON "consent_logs"("contact_id");

-- CreateIndex
CREATE INDEX "tables_event_id_idx" ON "tables"("event_id");

-- CreateIndex
CREATE INDEX "seats_table_id_idx" ON "seats"("table_id");

-- CreateIndex
CREATE UNIQUE INDEX "seats_table_id_index_key" ON "seats"("table_id", "index");

-- CreateIndex
CREATE INDEX "seat_assignments_guest_id_idx" ON "seat_assignments"("guest_id");

-- CreateIndex
CREATE UNIQUE INDEX "seat_assignments_seat_id_key" ON "seat_assignments"("seat_id");

-- CreateIndex
CREATE INDEX "checkins_event_id_idx" ON "checkins"("event_id");

-- CreateIndex
CREATE INDEX "checkins_guest_id_idx" ON "checkins"("guest_id");

-- CreateIndex
CREATE INDEX "message_templates_event_id_idx" ON "message_templates"("event_id");

-- CreateIndex
CREATE INDEX "event_logs_event_id_idx" ON "event_logs"("event_id");

-- CreateIndex
CREATE INDEX "event_logs_source_idx" ON "event_logs"("source");

-- CreateIndex
CREATE INDEX "event_logs_created_at_idx" ON "event_logs"("created_at");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segment_tags" ADD CONSTRAINT "segment_tags_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_tags" ADD CONSTRAINT "guest_tags_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_tags" ADD CONSTRAINT "guest_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "segment_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_scores" ADD CONSTRAINT "engagement_scores_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_scores" ADD CONSTRAINT "engagement_scores_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_entries" ADD CONSTRAINT "timeline_entries_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_related_vendor_id_fkey" FOREIGN KEY ("related_vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_media" ADD CONSTRAINT "vendor_media_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendor_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_reviews" ADD CONSTRAINT "vendor_reviews_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendor_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_notes" ADD CONSTRAINT "vendor_notes_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendor_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_status_log" ADD CONSTRAINT "vendor_status_log_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendor_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_registry_items" ADD CONSTRAINT "gift_registry_items_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_registry_items" ADD CONSTRAINT "gift_registry_items_buyer_contact_id_fkey" FOREIGN KEY ("buyer_contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_logs" ADD CONSTRAINT "consent_logs_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tables" ADD CONSTRAINT "tables_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_assignments" ADD CONSTRAINT "seat_assignments_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_assignments" ADD CONSTRAINT "seat_assignments_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_logs" ADD CONSTRAINT "event_logs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

