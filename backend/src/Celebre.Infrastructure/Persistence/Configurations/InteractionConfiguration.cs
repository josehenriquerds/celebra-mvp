using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class InteractionConfiguration : IEntityTypeConfiguration<Interaction>
{
    public void Configure(EntityTypeBuilder<Interaction> builder)
    {
        builder.ToTable("interactions");

        // Primary Key
        builder.HasKey(i => i.Id);

        // Properties
        builder.Property(i => i.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(i => i.EventId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("event_id");

        builder.Property(i => i.ContactId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("contact_id");

        builder.Property(i => i.Channel)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(i => i.Kind)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(i => i.PayloadJson)
            .IsRequired()
            .HasColumnType("jsonb")
            .HasColumnName("payload_json");

        builder.Property(i => i.OccurredAt)
            .IsRequired()
            .HasDefaultValueSql("now()")
            .HasColumnName("occurred_at");

        // Indexes
        builder.HasIndex(i => i.EventId);

        builder.HasIndex(i => i.ContactId);

        builder.HasIndex(i => i.OccurredAt);

        // Relationships
        builder.HasOne(i => i.Event)
            .WithMany(e => e.Interactions)
            .HasForeignKey(i => i.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(i => i.Contact)
            .WithMany(c => c.Interactions)
            .HasForeignKey(i => i.ContactId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
