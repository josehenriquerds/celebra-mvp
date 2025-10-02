using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class MessageTemplateConfiguration : IEntityTypeConfiguration<MessageTemplate>
{
    public void Configure(EntityTypeBuilder<MessageTemplate> builder)
    {
        builder.ToTable("message_templates");

        // Primary Key
        builder.HasKey(mt => mt.Id);

        // Properties
        builder.Property(mt => mt.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(mt => mt.EventId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("event_id");

        builder.Property(mt => mt.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(mt => mt.Variables)
            .IsRequired()
            .HasColumnType("text[]");

        builder.Property(mt => mt.ContentText)
            .IsRequired()
            .HasColumnType("text")
            .HasColumnName("content_text");

        builder.Property(mt => mt.ContentButtons)
            .HasColumnType("jsonb")
            .HasColumnName("content_buttons");

        builder.Property(mt => mt.Locale)
            .IsRequired()
            .HasMaxLength(10)
            .HasDefaultValue("pt_BR");

        builder.Property(mt => mt.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");

        builder.Property(mt => mt.UpdatedAt)
            .IsRequired()
            .HasColumnName("updated_at");

        // Indexes
        builder.HasIndex(mt => mt.EventId);

        // Relationships
        builder.HasOne(mt => mt.Event)
            .WithMany(e => e.MessageTemplates)
            .HasForeignKey(mt => mt.EventId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
