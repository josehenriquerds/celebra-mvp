using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class GiftRegistryItemConfiguration : IEntityTypeConfiguration<GiftRegistryItem>
{
    public void Configure(EntityTypeBuilder<GiftRegistryItem> builder)
    {
        builder.ToTable("gift_registry_items");

        // Primary Key
        builder.HasKey(gri => gri.Id);

        // Properties
        builder.Property(gri => gri.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(gri => gri.EventId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("event_id");

        builder.Property(gri => gri.Title)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(gri => gri.Link)
            .HasMaxLength(2000);

        builder.Property(gri => gri.Price)
            .HasPrecision(18, 2);

        builder.Property(gri => gri.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(GiftStatus.disponivel);

        builder.Property(gri => gri.BuyerContactId)
            .HasMaxLength(255)
            .HasColumnName("buyer_contact_id");

        builder.Property(gri => gri.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");

        builder.Property(gri => gri.UpdatedAt)
            .IsRequired()
            .HasColumnName("updated_at");

        // Indexes
        builder.HasIndex(gri => gri.EventId);

        builder.HasIndex(gri => gri.Status);

        // Relationships
        builder.HasOne(gri => gri.Event)
            .WithMany(e => e.GiftRegistryItems)
            .HasForeignKey(gri => gri.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(gri => gri.BuyerContact)
            .WithMany(c => c.GiftsPurchased)
            .HasForeignKey(gri => gri.BuyerContactId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
