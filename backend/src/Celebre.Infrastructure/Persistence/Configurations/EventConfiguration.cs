using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class EventConfiguration : IEntityTypeConfiguration<Event>
{
    public void Configure(EntityTypeBuilder<Event> builder)
    {
        builder.ToTable("events");

        // Primary Key
        builder.HasKey(e => e.Id);

        // Properties
        builder.Property(e => e.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(e => e.Title)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.DateTime)
            .IsRequired()
            .HasColumnName("date_time");

        builder.Property(e => e.VenueName)
            .IsRequired()
            .HasMaxLength(500)
            .HasColumnName("venue_name");

        builder.Property(e => e.Address)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(e => e.BudgetTotal)
            .HasPrecision(18, 2)
            .HasDefaultValue(0)
            .HasColumnName("budget_total");

        builder.Property(e => e.Hosts)
            .IsRequired()
            .HasColumnType("text[]");

        builder.Property(e => e.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");

        builder.Property(e => e.UpdatedAt)
            .IsRequired()
            .HasColumnName("updated_at");

        // Relationships
        builder.HasMany(e => e.Guests)
            .WithOne(g => g.Event)
            .HasForeignKey(g => g.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Tasks)
            .WithOne(t => t.Event)
            .HasForeignKey(t => t.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Vendors)
            .WithOne(v => v.Event)
            .HasForeignKey(v => v.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.GiftRegistryItems)
            .WithOne(g => g.Event)
            .HasForeignKey(g => g.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Tables)
            .WithOne(t => t.Event)
            .HasForeignKey(t => t.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.TimelineEntries)
            .WithOne(t => t.Event)
            .HasForeignKey(t => t.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.MessageTemplates)
            .WithOne(m => m.Event)
            .HasForeignKey(m => m.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.EventLogs)
            .WithOne(l => l.Event)
            .HasForeignKey(l => l.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.SegmentTags)
            .WithOne(s => s.Event)
            .HasForeignKey(s => s.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Interactions)
            .WithOne(i => i.Event)
            .HasForeignKey(i => i.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.EngagementScores)
            .WithOne(es => es.Event)
            .HasForeignKey(es => es.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Checkins)
            .WithOne(c => c.Event)
            .HasForeignKey(c => c.EventId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
