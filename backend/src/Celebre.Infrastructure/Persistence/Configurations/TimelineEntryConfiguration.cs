using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class TimelineEntryConfiguration : IEntityTypeConfiguration<TimelineEntry>
{
    public void Configure(EntityTypeBuilder<TimelineEntry> builder)
    {
        builder.ToTable("timeline_entries");

        // Primary Key
        builder.HasKey(te => te.Id);

        // Properties
        builder.Property(te => te.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(te => te.EventId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("event_id");

        builder.Property(te => te.ActorType)
            .IsRequired()
            .HasConversion<string>()
            .HasColumnName("actor_type");

        builder.Property(te => te.Type)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(te => te.RefId)
            .HasMaxLength(255)
            .HasColumnName("ref_id");

        builder.Property(te => te.OccurredAt)
            .IsRequired()
            .HasDefaultValueSql("now()")
            .HasColumnName("occurred_at");

        builder.Property(te => te.MetaJson)
            .HasColumnType("jsonb")
            .HasColumnName("meta_json");

        // Indexes
        builder.HasIndex(te => te.EventId);

        builder.HasIndex(te => te.OccurredAt);

        // Relationships
        builder.HasOne(te => te.Event)
            .WithMany(e => e.TimelineEntries)
            .HasForeignKey(te => te.EventId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
