using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class GuestConfiguration : IEntityTypeConfiguration<Guest>
{
    public void Configure(EntityTypeBuilder<Guest> builder)
    {
        builder.ToTable("guests");

        // Primary Key
        builder.HasKey(g => g.Id);

        // Properties
        builder.Property(g => g.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(g => g.EventId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("event_id");

        builder.Property(g => g.ContactId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("contact_id");

        builder.Property(g => g.InviteStatus)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(InviteStatus.nao_enviado)
            .HasColumnName("invite_status");

        builder.Property(g => g.Rsvp)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(RsvpStatus.pendente);

        builder.Property(g => g.Seats)
            .IsRequired()
            .HasDefaultValue(1);

        builder.Property(g => g.Children)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(g => g.TransportNeeded)
            .IsRequired()
            .HasDefaultValue(false)
            .HasColumnName("transport_needed");

        builder.Property(g => g.OptOut)
            .IsRequired()
            .HasDefaultValue(false)
            .HasColumnName("opt_out");

        builder.Property(g => g.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");

        builder.Property(g => g.UpdatedAt)
            .IsRequired()
            .HasColumnName("updated_at");

        // Indexes
        builder.HasIndex(g => new { g.EventId, g.ContactId })
            .IsUnique();

        builder.HasIndex(g => g.EventId);

        builder.HasIndex(g => g.ContactId);

        builder.HasIndex(g => g.Rsvp);

        // Relationships
        builder.HasOne(g => g.Event)
            .WithMany(e => e.Guests)
            .HasForeignKey(g => g.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(g => g.Contact)
            .WithMany(c => c.Guests)
            .HasForeignKey(g => g.ContactId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(g => g.Tags)
            .WithOne(gt => gt.Guest)
            .HasForeignKey(gt => gt.GuestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(g => g.SeatAssignments)
            .WithOne(sa => sa.Guest)
            .HasForeignKey(sa => sa.GuestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(g => g.Checkins)
            .WithOne(c => c.Guest)
            .HasForeignKey(c => c.GuestId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
