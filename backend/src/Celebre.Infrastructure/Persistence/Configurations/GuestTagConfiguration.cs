using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class GuestTagConfiguration : IEntityTypeConfiguration<GuestTag>
{
    public void Configure(EntityTypeBuilder<GuestTag> builder)
    {
        builder.ToTable("guest_tags");

        // Composite Primary Key
        builder.HasKey(gt => new { gt.GuestId, gt.TagId });

        // Properties
        builder.Property(gt => gt.GuestId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("guest_id");

        builder.Property(gt => gt.TagId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("tag_id");

        // Relationships
        builder.HasOne(gt => gt.Guest)
            .WithMany(g => g.Tags)
            .HasForeignKey(gt => gt.GuestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(gt => gt.Tag)
            .WithMany(st => st.Guests)
            .HasForeignKey(gt => gt.TagId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
