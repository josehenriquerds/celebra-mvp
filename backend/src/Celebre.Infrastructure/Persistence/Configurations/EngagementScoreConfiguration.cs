using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class EngagementScoreConfiguration : IEntityTypeConfiguration<EngagementScore>
{
    public void Configure(EntityTypeBuilder<EngagementScore> builder)
    {
        builder.ToTable("engagement_scores");

        // Composite Primary Key
        builder.HasKey(es => new { es.ContactId, es.EventId });

        // Properties
        builder.Property(es => es.ContactId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("contact_id");

        builder.Property(es => es.EventId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("event_id");

        builder.Property(es => es.Value)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(es => es.Tier)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(EngagementTier.bronze);

        builder.Property(es => es.UpdatedAt)
            .IsRequired()
            .HasColumnName("updated_at");

        // Indexes
        builder.HasIndex(es => new { es.EventId, es.Tier });

        // Relationships
        builder.HasOne(es => es.Contact)
            .WithMany(c => c.EngagementScores)
            .HasForeignKey(es => es.ContactId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(es => es.Event)
            .WithMany(e => e.EngagementScores)
            .HasForeignKey(es => es.EventId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
