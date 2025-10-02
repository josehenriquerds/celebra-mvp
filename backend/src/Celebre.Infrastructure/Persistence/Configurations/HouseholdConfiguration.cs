using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class HouseholdConfiguration : IEntityTypeConfiguration<Household>
{
    public void Configure(EntityTypeBuilder<Household> builder)
    {
        builder.ToTable("households");

        // Primary Key
        builder.HasKey(h => h.Id);

        // Properties
        builder.Property(h => h.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(h => h.Label)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(h => h.SizeCached)
            .IsRequired()
            .HasDefaultValue(1)
            .HasColumnName("size_cached");

        builder.Property(h => h.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");

        builder.Property(h => h.UpdatedAt)
            .IsRequired()
            .HasColumnName("updated_at");

        // Relationships
        builder.HasMany(h => h.Contacts)
            .WithOne(c => c.Household)
            .HasForeignKey(c => c.HouseholdId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
