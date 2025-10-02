using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class CheckinConfiguration : IEntityTypeConfiguration<Checkin>
{
    public void Configure(EntityTypeBuilder<Checkin> builder)
    {
        builder.ToTable("checkins");

        // Primary Key
        builder.HasKey(c => c.Id);

        // Properties
        builder.Property(c => c.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(c => c.EventId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("event_id");

        builder.Property(c => c.GuestId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("guest_id");

        builder.Property(c => c.AtGate)
            .IsRequired()
            .HasDefaultValue(true)
            .HasColumnName("at_gate");

        builder.Property(c => c.Timestamp)
            .IsRequired()
            .HasDefaultValueSql("now()");

        // Indexes
        builder.HasIndex(c => c.EventId);

        builder.HasIndex(c => c.GuestId);

        // Relationships
        builder.HasOne(c => c.Event)
            .WithMany(e => e.Checkins)
            .HasForeignKey(c => c.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(c => c.Guest)
            .WithMany(g => g.Checkins)
            .HasForeignKey(c => c.GuestId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
