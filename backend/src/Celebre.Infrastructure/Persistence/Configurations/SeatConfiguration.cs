using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class SeatConfiguration : IEntityTypeConfiguration<Seat>
{
    public void Configure(EntityTypeBuilder<Seat> builder)
    {
        builder.ToTable("seats");

        // Primary Key
        builder.HasKey(s => s.Id);

        // Properties
        builder.Property(s => s.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(s => s.TableId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("table_id");

        builder.Property(s => s.Index)
            .IsRequired();

        builder.Property(s => s.X)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(s => s.Y)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(s => s.Rotation)
            .IsRequired()
            .HasDefaultValue(0);

        // Indexes
        builder.HasIndex(s => new { s.TableId, s.Index })
            .IsUnique();

        builder.HasIndex(s => s.TableId);

        // Relationships
        builder.HasOne(s => s.Table)
            .WithMany(t => t.Seats)
            .HasForeignKey(s => s.TableId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Assignments)
            .WithOne(sa => sa.Seat)
            .HasForeignKey(sa => sa.SeatId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
