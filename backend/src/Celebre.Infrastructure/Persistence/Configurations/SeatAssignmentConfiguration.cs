using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class SeatAssignmentConfiguration : IEntityTypeConfiguration<SeatAssignment>
{
    public void Configure(EntityTypeBuilder<SeatAssignment> builder)
    {
        builder.ToTable("seat_assignments");

        // Primary Key
        builder.HasKey(sa => sa.Id);

        // Properties
        builder.Property(sa => sa.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(sa => sa.GuestId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("guest_id");

        builder.Property(sa => sa.SeatId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("seat_id");

        builder.Property(sa => sa.Locked)
            .IsRequired()
            .HasDefaultValue(false);

        // Indexes
        builder.HasIndex(sa => sa.SeatId)
            .IsUnique();

        builder.HasIndex(sa => sa.GuestId);

        // Relationships
        builder.HasOne(sa => sa.Guest)
            .WithMany(g => g.SeatAssignments)
            .HasForeignKey(sa => sa.GuestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(sa => sa.Seat)
            .WithMany(s => s.Assignments)
            .HasForeignKey(sa => sa.SeatId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
