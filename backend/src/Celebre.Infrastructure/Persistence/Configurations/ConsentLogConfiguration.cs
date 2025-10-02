using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class ConsentLogConfiguration : IEntityTypeConfiguration<ConsentLog>
{
    public void Configure(EntityTypeBuilder<ConsentLog> builder)
    {
        builder.ToTable("consent_logs");

        // Primary Key
        builder.HasKey(cl => cl.Id);

        // Properties
        builder.Property(cl => cl.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(cl => cl.ContactId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("contact_id");

        builder.Property(cl => cl.Source)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(cl => cl.Action)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(cl => cl.Text)
            .HasColumnType("text");

        builder.Property(cl => cl.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");

        // Indexes
        builder.HasIndex(cl => cl.ContactId);

        // Relationships
        builder.HasOne(cl => cl.Contact)
            .WithMany(c => c.ConsentLogs)
            .HasForeignKey(cl => cl.ContactId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
