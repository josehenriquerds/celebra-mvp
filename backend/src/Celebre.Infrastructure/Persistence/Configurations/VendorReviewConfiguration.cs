using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class VendorReviewConfiguration : IEntityTypeConfiguration<VendorReview>
{
    public void Configure(EntityTypeBuilder<VendorReview> builder)
    {
        builder.ToTable("vendor_reviews");

        // Primary Key
        builder.HasKey(vr => vr.Id);

        // Properties
        builder.Property(vr => vr.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(vr => vr.VendorId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("vendor_id");

        builder.Property(vr => vr.Rating)
            .IsRequired();

        builder.Property(vr => vr.Comment)
            .HasColumnType("text");

        builder.Property(vr => vr.AuthorContactId)
            .HasMaxLength(255)
            .HasColumnName("author_contact_id");

        builder.Property(vr => vr.EventId)
            .HasMaxLength(255)
            .HasColumnName("event_id");

        builder.Property(vr => vr.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");

        // Indexes
        builder.HasIndex(vr => vr.VendorId);

        builder.HasIndex(vr => vr.Rating);

        // Relationships
        builder.HasOne(vr => vr.Vendor)
            .WithMany(vp => vp.Reviews)
            .HasForeignKey(vr => vr.VendorId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
