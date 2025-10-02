using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class VendorPartnerConfiguration : IEntityTypeConfiguration<VendorPartner>
{
    public void Configure(EntityTypeBuilder<VendorPartner> builder)
    {
        builder.ToTable("vendor_partners");

        // Primary Key
        builder.HasKey(vp => vp.Id);

        // Properties
        builder.Property(vp => vp.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(vp => vp.UserId)
            .HasMaxLength(255)
            .HasColumnName("user_id");

        builder.Property(vp => vp.Slug)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(vp => vp.CompanyName)
            .IsRequired()
            .HasMaxLength(500)
            .HasColumnName("company_name");

        builder.Property(vp => vp.ContactName)
            .IsRequired()
            .HasMaxLength(500)
            .HasColumnName("contact_name");

        builder.Property(vp => vp.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(vp => vp.PhoneE164)
            .IsRequired()
            .HasMaxLength(50)
            .HasColumnName("phone_e164");

        builder.Property(vp => vp.InstagramHandle)
            .HasMaxLength(255)
            .HasColumnName("instagram_handle");

        builder.Property(vp => vp.WebsiteUrl)
            .HasMaxLength(1000)
            .HasColumnName("website_url");

        builder.Property(vp => vp.WhatsappUrl)
            .HasMaxLength(1000)
            .HasColumnName("whatsapp_url");

        // Location
        builder.Property(vp => vp.City)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(vp => vp.State)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(vp => vp.Country)
            .IsRequired()
            .HasMaxLength(10)
            .HasDefaultValue("BR");

        builder.Property(vp => vp.ServiceRadiusKm)
            .HasColumnName("service_radius_km");

        // Business info
        builder.Property(vp => vp.Categories)
            .IsRequired()
            .HasColumnType("text[]");

        builder.Property(vp => vp.PriceFromCents)
            .HasColumnName("price_from_cents");

        builder.Property(vp => vp.DescriptionShort)
            .HasMaxLength(280)
            .HasColumnName("description_short");

        builder.Property(vp => vp.DescriptionLong)
            .HasColumnType("text")
            .HasColumnName("description_long");

        // Status & moderation
        builder.Property(vp => vp.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(VendorPartnerStatus.pending_review);

        builder.Property(vp => vp.ProfileScore)
            .IsRequired()
            .HasDefaultValue(0)
            .HasColumnName("profile_score");

        // LGPD
        builder.Property(vp => vp.ConsentText)
            .HasColumnType("text")
            .HasColumnName("consent_text");

        builder.Property(vp => vp.ConsentAt)
            .HasColumnName("consent_at");

        builder.Property(vp => vp.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");

        builder.Property(vp => vp.UpdatedAt)
            .IsRequired()
            .HasColumnName("updated_at");

        // Indexes
        builder.HasIndex(vp => vp.Slug)
            .IsUnique();

        builder.HasIndex(vp => vp.Email)
            .IsUnique();

        builder.HasIndex(vp => vp.PhoneE164)
            .IsUnique();

        builder.HasIndex(vp => vp.Status);

        builder.HasIndex(vp => new { vp.City, vp.State });

        // Relationships
        builder.HasMany(vp => vp.Media)
            .WithOne(m => m.Vendor)
            .HasForeignKey(m => m.VendorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(vp => vp.Reviews)
            .WithOne(r => r.Vendor)
            .HasForeignKey(r => r.VendorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(vp => vp.Notes)
            .WithOne(n => n.Vendor)
            .HasForeignKey(n => n.VendorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(vp => vp.StatusLog)
            .WithOne(sl => sl.Vendor)
            .HasForeignKey(sl => sl.VendorId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
