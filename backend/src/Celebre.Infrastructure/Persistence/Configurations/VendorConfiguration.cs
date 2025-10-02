using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class VendorConfiguration : IEntityTypeConfiguration<Vendor>
{
    public void Configure(EntityTypeBuilder<Vendor> builder)
    {
        builder.ToTable("vendors");

        // Primary Key
        builder.HasKey(v => v.Id);

        // Properties
        builder.Property(v => v.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(v => v.EventId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("event_id");

        builder.Property(v => v.Name)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(v => v.Phone)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(v => v.Category)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(v => v.ContractValue)
            .HasPrecision(18, 2)
            .HasColumnName("contract_value");

        builder.Property(v => v.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(VendorStatus.ativo);

        builder.Property(v => v.Notes)
            .HasColumnType("text");

        builder.Property(v => v.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");

        builder.Property(v => v.UpdatedAt)
            .IsRequired()
            .HasColumnName("updated_at");

        // Indexes
        builder.HasIndex(v => v.EventId);

        // Relationships
        builder.HasOne(v => v.Event)
            .WithMany(e => e.Vendors)
            .HasForeignKey(v => v.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(v => v.Tasks)
            .WithOne(t => t.RelatedVendor)
            .HasForeignKey(t => t.RelatedVendorId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
