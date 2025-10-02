using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class VendorStatusLogConfiguration : IEntityTypeConfiguration<VendorStatusLog>
{
    public void Configure(EntityTypeBuilder<VendorStatusLog> builder)
    {
        builder.ToTable("vendor_status_log");

        // Primary Key
        builder.HasKey(vsl => vsl.Id);

        // Properties
        builder.Property(vsl => vsl.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(vsl => vsl.VendorId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("vendor_id");

        builder.Property(vsl => vsl.Action)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(vsl => vsl.ActorUserId)
            .HasMaxLength(255)
            .HasColumnName("actor_user_id");

        builder.Property(vsl => vsl.Reason)
            .HasColumnType("text");

        builder.Property(vsl => vsl.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");

        // Indexes
        builder.HasIndex(vsl => vsl.VendorId);

        builder.HasIndex(vsl => vsl.CreatedAt);

        // Relationships
        builder.HasOne(vsl => vsl.Vendor)
            .WithMany(vp => vp.StatusLog)
            .HasForeignKey(vsl => vsl.VendorId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
