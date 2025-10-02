using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class EventLogConfiguration : IEntityTypeConfiguration<EventLog>
{
    public void Configure(EntityTypeBuilder<EventLog> builder)
    {
        builder.ToTable("event_logs");

        // Primary Key
        builder.HasKey(el => el.Id);

        // Properties
        builder.Property(el => el.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(el => el.EventId)
            .HasMaxLength(255)
            .HasColumnName("event_id");

        builder.Property(el => el.Source)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(el => el.Type)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(el => el.PayloadJson)
            .IsRequired()
            .HasColumnType("jsonb")
            .HasColumnName("payload_json");

        builder.Property(el => el.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");

        // Indexes
        builder.HasIndex(el => el.EventId);

        builder.HasIndex(el => el.Source);

        builder.HasIndex(el => el.CreatedAt);

        // Relationships
        builder.HasOne(el => el.Event)
            .WithMany(e => e.EventLogs)
            .HasForeignKey(el => el.EventId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
