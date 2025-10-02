using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class ContactConfiguration : IEntityTypeConfiguration<Contact>
{
    public void Configure(EntityTypeBuilder<Contact> builder)
    {
        builder.ToTable("contacts");

        // Primary Key
        builder.HasKey(c => c.Id);

        // Properties
        builder.Property(c => c.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(c => c.FullName)
            .IsRequired()
            .HasMaxLength(500)
            .HasColumnName("full_name");

        builder.Property(c => c.Phone)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.Email)
            .HasMaxLength(255);

        builder.Property(c => c.Relation)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(ContactRelation.amigo);

        builder.Property(c => c.Notes)
            .HasColumnType("text");

        builder.Property(c => c.RestrictionsJson)
            .HasColumnType("jsonb")
            .HasColumnName("restrictions_json");

        builder.Property(c => c.IsVip)
            .IsRequired()
            .HasDefaultValue(false)
            .HasColumnName("is_vip");

        builder.Property(c => c.HouseholdId)
            .HasMaxLength(255)
            .HasColumnName("household_id");

        builder.Property(c => c.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");

        builder.Property(c => c.UpdatedAt)
            .IsRequired()
            .HasColumnName("updated_at");

        // Indexes
        builder.HasIndex(c => c.Phone)
            .IsUnique();

        // Relationships
        builder.HasOne(c => c.Household)
            .WithMany(h => h.Contacts)
            .HasForeignKey(c => c.HouseholdId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(c => c.Guests)
            .WithOne(g => g.Contact)
            .HasForeignKey(g => g.ContactId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.Interactions)
            .WithOne(i => i.Contact)
            .HasForeignKey(i => i.ContactId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.EngagementScores)
            .WithOne(es => es.Contact)
            .HasForeignKey(es => es.ContactId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.ConsentLogs)
            .WithOne(cl => cl.Contact)
            .HasForeignKey(cl => cl.ContactId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.GiftsPurchased)
            .WithOne(g => g.BuyerContact)
            .HasForeignKey(g => g.BuyerContactId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
