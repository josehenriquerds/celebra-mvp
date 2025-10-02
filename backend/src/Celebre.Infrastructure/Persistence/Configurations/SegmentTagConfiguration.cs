using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class SegmentTagConfiguration : IEntityTypeConfiguration<SegmentTag>
{
    public void Configure(EntityTypeBuilder<SegmentTag> builder)
    {
        builder.ToTable("segment_tags");

        // Primary Key
        builder.HasKey(st => st.Id);

        // Properties
        builder.Property(st => st.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(st => st.EventId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("event_id");

        builder.Property(st => st.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(st => st.RuleJson)
            .IsRequired()
            .HasColumnType("jsonb")
            .HasColumnName("rule_json");

        builder.Property(st => st.IsDynamic)
            .IsRequired()
            .HasDefaultValue(true)
            .HasColumnName("is_dynamic");

        builder.Property(st => st.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");

        builder.Property(st => st.UpdatedAt)
            .IsRequired()
            .HasColumnName("updated_at");

        // Relationships
        builder.HasOne(st => st.Event)
            .WithMany(e => e.SegmentTags)
            .HasForeignKey(st => st.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(st => st.Guests)
            .WithOne(gt => gt.Tag)
            .HasForeignKey(gt => gt.TagId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
