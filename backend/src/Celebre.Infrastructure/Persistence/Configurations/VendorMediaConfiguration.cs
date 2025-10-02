using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class VendorMediaConfiguration : IEntityTypeConfiguration<VendorMedia>
{
    public void Configure(EntityTypeBuilder<VendorMedia> builder)
    {
        builder.ToTable("vendor_media");

        // Primary Key
        builder.HasKey(vm => vm.Id);

        // Properties
        builder.Property(vm => vm.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(vm => vm.VendorId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("vendor_id");

        builder.Property(vm => vm.Type)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(vm => vm.Url)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(vm => vm.Width);

        builder.Property(vm => vm.Height);

        builder.Property(vm => vm.Blurhash)
            .HasMaxLength(255);

        builder.Property(vm => vm.Alt)
            .HasMaxLength(500);

        builder.Property(vm => vm.SortOrder)
            .IsRequired()
            .HasDefaultValue(0)
            .HasColumnName("sort_order");

        // Indexes
        builder.HasIndex(vm => new { vm.VendorId, vm.Type });

        builder.HasIndex(vm => vm.SortOrder);

        // Relationships
        builder.HasOne(vm => vm.Vendor)
            .WithMany(vp => vp.Media)
            .HasForeignKey(vm => vm.VendorId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
