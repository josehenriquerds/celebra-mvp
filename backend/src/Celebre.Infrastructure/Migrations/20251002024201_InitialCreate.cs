using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Celebre.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "events",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    date_time = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    venue_name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    address = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    budget_total = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    hosts = table.Column<List<string>>(type: "text[]", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_events", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "households",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    label = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    size_cached = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_households", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "vendor_partners",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    user_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    slug = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    company_name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    contact_name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    phone_e164 = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    instagram_handle = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    website_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    whatsapp_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    city = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    state = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    country = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "BR"),
                    service_radius_km = table.Column<int>(type: "integer", nullable: true),
                    categories = table.Column<List<string>>(type: "text[]", nullable: false),
                    price_from_cents = table.Column<int>(type: "integer", nullable: true),
                    description_short = table.Column<string>(type: "character varying(280)", maxLength: 280, nullable: true),
                    description_long = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false, defaultValue: "pending_review"),
                    profile_score = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    consent_text = table.Column<string>(type: "text", nullable: true),
                    consent_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vendor_partners", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "event_logs",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    event_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    source = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    type = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    payload_json = table.Column<string>(type: "jsonb", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_event_logs", x => x.id);
                    table.ForeignKey(
                        name: "fk_event_logs_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "message_templates",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    event_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    variables = table.Column<List<string>>(type: "text[]", nullable: false),
                    content_text = table.Column<string>(type: "text", nullable: false),
                    content_buttons = table.Column<string>(type: "jsonb", nullable: true),
                    locale = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "pt_BR"),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_message_templates", x => x.id);
                    table.ForeignKey(
                        name: "fk_message_templates_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "segment_tags",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    event_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    rule_json = table.Column<string>(type: "jsonb", nullable: false),
                    is_dynamic = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_segment_tags", x => x.id);
                    table.ForeignKey(
                        name: "fk_segment_tags_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tables",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    event_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    label = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    capacity = table.Column<int>(type: "integer", nullable: false),
                    zone = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    x = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                    y = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                    rotation = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                    shape = table.Column<string>(type: "text", nullable: false, defaultValue: "round"),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tables", x => x.id);
                    table.ForeignKey(
                        name: "fk_tables_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "timeline_entries",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    event_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    actor_type = table.Column<string>(type: "text", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    ref_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    occurred_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    meta_json = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_timeline_entries", x => x.id);
                    table.ForeignKey(
                        name: "fk_timeline_entries_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vendors",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    event_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    category = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    contract_value = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    status = table.Column<string>(type: "text", nullable: false, defaultValue: "ativo"),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vendors", x => x.id);
                    table.ForeignKey(
                        name: "fk_vendors_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "contacts",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    full_name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    relation = table.Column<string>(type: "text", nullable: false, defaultValue: "amigo"),
                    notes = table.Column<string>(type: "text", nullable: true),
                    restrictions_json = table.Column<string>(type: "jsonb", nullable: true),
                    is_vip = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    household_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_contacts", x => x.id);
                    table.ForeignKey(
                        name: "fk_contacts_households_household_id",
                        column: x => x.household_id,
                        principalTable: "households",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "vendor_media",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    vendor_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    url = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    width = table.Column<int>(type: "integer", nullable: true),
                    height = table.Column<int>(type: "integer", nullable: true),
                    blurhash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    alt = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vendor_media", x => x.id);
                    table.ForeignKey(
                        name: "fk_vendor_media_vendor_partners_vendor_id",
                        column: x => x.vendor_id,
                        principalTable: "vendor_partners",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vendor_notes",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    vendor_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    author_user_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    note_text = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vendor_notes", x => x.id);
                    table.ForeignKey(
                        name: "fk_vendor_notes_vendor_partners_vendor_id",
                        column: x => x.vendor_id,
                        principalTable: "vendor_partners",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vendor_reviews",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    vendor_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    rating = table.Column<int>(type: "integer", nullable: false),
                    comment = table.Column<string>(type: "text", nullable: true),
                    author_contact_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    event_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vendor_reviews", x => x.id);
                    table.ForeignKey(
                        name: "fk_vendor_reviews_vendor_partners_vendor_id",
                        column: x => x.vendor_id,
                        principalTable: "vendor_partners",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vendor_status_log",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    vendor_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    action = table.Column<string>(type: "text", nullable: false),
                    actor_user_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    reason = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vendor_status_log", x => x.id);
                    table.ForeignKey(
                        name: "fk_vendor_status_log_vendor_partners_vendor_id",
                        column: x => x.vendor_id,
                        principalTable: "vendor_partners",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "seats",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    table_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    index = table.Column<int>(type: "integer", nullable: false),
                    x = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                    y = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                    rotation = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_seats", x => x.id);
                    table.ForeignKey(
                        name: "fk_seats_tables_table_id",
                        column: x => x.table_id,
                        principalTable: "tables",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tasks",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    event_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    assignee_user_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    due_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false, defaultValue: "aberta"),
                    sla_hours = table.Column<int>(type: "integer", nullable: true),
                    related_vendor_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tasks", x => x.id);
                    table.ForeignKey(
                        name: "fk_tasks_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_tasks_vendors_related_vendor_id",
                        column: x => x.related_vendor_id,
                        principalTable: "vendors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "consent_logs",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    contact_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    source = table.Column<string>(type: "text", nullable: false),
                    action = table.Column<string>(type: "text", nullable: false),
                    text = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_consent_logs", x => x.id);
                    table.ForeignKey(
                        name: "fk_consent_logs_contacts_contact_id",
                        column: x => x.contact_id,
                        principalTable: "contacts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "engagement_scores",
                columns: table => new
                {
                    contact_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    event_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    value = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    tier = table.Column<string>(type: "text", nullable: false, defaultValue: "bronze"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_engagement_scores", x => new { x.contact_id, x.event_id });
                    table.ForeignKey(
                        name: "fk_engagement_scores_contacts_contact_id",
                        column: x => x.contact_id,
                        principalTable: "contacts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_engagement_scores_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "gift_registry_items",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    event_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    link = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    status = table.Column<string>(type: "text", nullable: false, defaultValue: "disponivel"),
                    buyer_contact_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_gift_registry_items", x => x.id);
                    table.ForeignKey(
                        name: "fk_gift_registry_items_contacts_buyer_contact_id",
                        column: x => x.buyer_contact_id,
                        principalTable: "contacts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_gift_registry_items_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "guests",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    event_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    contact_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    invite_status = table.Column<string>(type: "text", nullable: false, defaultValue: "nao_enviado"),
                    rsvp = table.Column<string>(type: "text", nullable: false, defaultValue: "pendente"),
                    seats = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    children = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    transport_needed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    opt_out = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_guests", x => x.id);
                    table.ForeignKey(
                        name: "fk_guests_contacts_contact_id",
                        column: x => x.contact_id,
                        principalTable: "contacts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_guests_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "interactions",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    event_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    contact_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    channel = table.Column<string>(type: "text", nullable: false),
                    kind = table.Column<string>(type: "text", nullable: false),
                    payload_json = table.Column<string>(type: "jsonb", nullable: false),
                    occurred_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_interactions", x => x.id);
                    table.ForeignKey(
                        name: "fk_interactions_contacts_contact_id",
                        column: x => x.contact_id,
                        principalTable: "contacts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_interactions_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "checkins",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    event_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    guest_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    at_gate = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    timestamp = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_checkins", x => x.id);
                    table.ForeignKey(
                        name: "fk_checkins_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_checkins_guests_guest_id",
                        column: x => x.guest_id,
                        principalTable: "guests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "guest_tags",
                columns: table => new
                {
                    guest_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    tag_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_guest_tags", x => new { x.guest_id, x.tag_id });
                    table.ForeignKey(
                        name: "fk_guest_tags_guests_guest_id",
                        column: x => x.guest_id,
                        principalTable: "guests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_guest_tags_segment_tags_tag_id",
                        column: x => x.tag_id,
                        principalTable: "segment_tags",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "seat_assignments",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    guest_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    seat_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    locked = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_seat_assignments", x => x.id);
                    table.ForeignKey(
                        name: "fk_seat_assignments_guests_guest_id",
                        column: x => x.guest_id,
                        principalTable: "guests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_seat_assignments_seats_seat_id",
                        column: x => x.seat_id,
                        principalTable: "seats",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_checkins_event_id",
                table: "checkins",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "ix_checkins_guest_id",
                table: "checkins",
                column: "guest_id");

            migrationBuilder.CreateIndex(
                name: "ix_consent_logs_contact_id",
                table: "consent_logs",
                column: "contact_id");

            migrationBuilder.CreateIndex(
                name: "ix_contacts_household_id",
                table: "contacts",
                column: "household_id");

            migrationBuilder.CreateIndex(
                name: "ix_contacts_phone",
                table: "contacts",
                column: "phone",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_engagement_scores_event_id_tier",
                table: "engagement_scores",
                columns: new[] { "event_id", "tier" });

            migrationBuilder.CreateIndex(
                name: "ix_event_logs_created_at",
                table: "event_logs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_event_logs_event_id",
                table: "event_logs",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "ix_event_logs_source",
                table: "event_logs",
                column: "source");

            migrationBuilder.CreateIndex(
                name: "ix_gift_registry_items_buyer_contact_id",
                table: "gift_registry_items",
                column: "buyer_contact_id");

            migrationBuilder.CreateIndex(
                name: "ix_gift_registry_items_event_id",
                table: "gift_registry_items",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "ix_gift_registry_items_status",
                table: "gift_registry_items",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_guest_tags_tag_id",
                table: "guest_tags",
                column: "tag_id");

            migrationBuilder.CreateIndex(
                name: "ix_guests_contact_id",
                table: "guests",
                column: "contact_id");

            migrationBuilder.CreateIndex(
                name: "ix_guests_event_id",
                table: "guests",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "ix_guests_event_id_contact_id",
                table: "guests",
                columns: new[] { "event_id", "contact_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_guests_rsvp",
                table: "guests",
                column: "rsvp");

            migrationBuilder.CreateIndex(
                name: "ix_interactions_contact_id",
                table: "interactions",
                column: "contact_id");

            migrationBuilder.CreateIndex(
                name: "ix_interactions_event_id",
                table: "interactions",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "ix_interactions_occurred_at",
                table: "interactions",
                column: "occurred_at");

            migrationBuilder.CreateIndex(
                name: "ix_message_templates_event_id",
                table: "message_templates",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "ix_seat_assignments_guest_id",
                table: "seat_assignments",
                column: "guest_id");

            migrationBuilder.CreateIndex(
                name: "ix_seat_assignments_seat_id",
                table: "seat_assignments",
                column: "seat_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_seats_table_id",
                table: "seats",
                column: "table_id");

            migrationBuilder.CreateIndex(
                name: "ix_seats_table_id_index",
                table: "seats",
                columns: new[] { "table_id", "index" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_segment_tags_event_id",
                table: "segment_tags",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "ix_tables_event_id",
                table: "tables",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "ix_tasks_due_at",
                table: "tasks",
                column: "due_at");

            migrationBuilder.CreateIndex(
                name: "ix_tasks_event_id",
                table: "tasks",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "ix_tasks_related_vendor_id",
                table: "tasks",
                column: "related_vendor_id");

            migrationBuilder.CreateIndex(
                name: "ix_tasks_status",
                table: "tasks",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_timeline_entries_event_id",
                table: "timeline_entries",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "ix_timeline_entries_occurred_at",
                table: "timeline_entries",
                column: "occurred_at");

            migrationBuilder.CreateIndex(
                name: "ix_vendor_media_sort_order",
                table: "vendor_media",
                column: "sort_order");

            migrationBuilder.CreateIndex(
                name: "ix_vendor_media_vendor_id_type",
                table: "vendor_media",
                columns: new[] { "vendor_id", "type" });

            migrationBuilder.CreateIndex(
                name: "ix_vendor_notes_vendor_id",
                table: "vendor_notes",
                column: "vendor_id");

            migrationBuilder.CreateIndex(
                name: "ix_vendor_partners_city_state",
                table: "vendor_partners",
                columns: new[] { "city", "state" });

            migrationBuilder.CreateIndex(
                name: "ix_vendor_partners_email",
                table: "vendor_partners",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_vendor_partners_phone_e164",
                table: "vendor_partners",
                column: "phone_e164",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_vendor_partners_slug",
                table: "vendor_partners",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_vendor_partners_status",
                table: "vendor_partners",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_vendor_reviews_rating",
                table: "vendor_reviews",
                column: "rating");

            migrationBuilder.CreateIndex(
                name: "ix_vendor_reviews_vendor_id",
                table: "vendor_reviews",
                column: "vendor_id");

            migrationBuilder.CreateIndex(
                name: "ix_vendor_status_log_created_at",
                table: "vendor_status_log",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_vendor_status_log_vendor_id",
                table: "vendor_status_log",
                column: "vendor_id");

            migrationBuilder.CreateIndex(
                name: "ix_vendors_event_id",
                table: "vendors",
                column: "event_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "checkins");

            migrationBuilder.DropTable(
                name: "consent_logs");

            migrationBuilder.DropTable(
                name: "engagement_scores");

            migrationBuilder.DropTable(
                name: "event_logs");

            migrationBuilder.DropTable(
                name: "gift_registry_items");

            migrationBuilder.DropTable(
                name: "guest_tags");

            migrationBuilder.DropTable(
                name: "interactions");

            migrationBuilder.DropTable(
                name: "message_templates");

            migrationBuilder.DropTable(
                name: "seat_assignments");

            migrationBuilder.DropTable(
                name: "tasks");

            migrationBuilder.DropTable(
                name: "timeline_entries");

            migrationBuilder.DropTable(
                name: "vendor_media");

            migrationBuilder.DropTable(
                name: "vendor_notes");

            migrationBuilder.DropTable(
                name: "vendor_reviews");

            migrationBuilder.DropTable(
                name: "vendor_status_log");

            migrationBuilder.DropTable(
                name: "segment_tags");

            migrationBuilder.DropTable(
                name: "guests");

            migrationBuilder.DropTable(
                name: "seats");

            migrationBuilder.DropTable(
                name: "vendors");

            migrationBuilder.DropTable(
                name: "vendor_partners");

            migrationBuilder.DropTable(
                name: "contacts");

            migrationBuilder.DropTable(
                name: "tables");

            migrationBuilder.DropTable(
                name: "households");

            migrationBuilder.DropTable(
                name: "events");
        }
    }
}
