using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class TableConfiguration : IEntityTypeConfiguration<Table>
{
    public void Configure(EntityTypeBuilder<Table> builder)
    {
        builder.ToTable("tables");

        // Primary Key
        builder.HasKey(t => t.Id);

        // Properties
        builder.Property(t => t.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(t => t.EventId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("event_id");

        builder.Property(t => t.Label)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(t => t.Capacity)
            .IsRequired();

        builder.Property(t => t.Zone)
            .HasMaxLength(255);

        builder.Property(t => t.X)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(t => t.Y)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(t => t.Rotation)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(t => t.Shape)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(TableShape.round);

        builder.Property(t => t.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");

        builder.Property(t => t.UpdatedAt)
            .IsRequired()
            .HasColumnName("updated_at");

        // Indexes
        builder.HasIndex(t => t.EventId);

        // Relationships
        builder.HasOne(t => t.Event)
            .WithMany(e => e.Tables)
            .HasForeignKey(t => t.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.Seats)
            .WithOne(s => s.Table)
            .HasForeignKey(s => s.TableId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
