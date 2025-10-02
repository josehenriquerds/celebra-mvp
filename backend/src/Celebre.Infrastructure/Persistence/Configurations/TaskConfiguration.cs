using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;
using TaskEntity = Celebre.Domain.Entities.Task;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class TaskConfiguration : IEntityTypeConfiguration<TaskEntity>
{
    public void Configure(EntityTypeBuilder<TaskEntity> builder)
    {
        builder.ToTable("tasks");

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

        builder.Property(t => t.Title)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(t => t.AssigneeUserId)
            .HasMaxLength(255)
            .HasColumnName("assignee_user_id");

        builder.Property(t => t.DueAt)
            .HasColumnName("due_at");

        builder.Property(t => t.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(Domain.Enums.TaskStatus.aberta);

        builder.Property(t => t.SlaHours)
            .HasColumnName("sla_hours");

        builder.Property(t => t.RelatedVendorId)
            .HasMaxLength(255)
            .HasColumnName("related_vendor_id");

        builder.Property(t => t.Description)
            .HasColumnType("text");

        builder.Property(t => t.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");

        builder.Property(t => t.UpdatedAt)
            .IsRequired()
            .HasColumnName("updated_at");

        // Indexes
        builder.HasIndex(t => t.EventId);

        builder.HasIndex(t => t.Status);

        builder.HasIndex(t => t.DueAt);

        // Relationships
        builder.HasOne(t => t.Event)
            .WithMany(e => e.Tasks)
            .HasForeignKey(t => t.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(t => t.RelatedVendor)
            .WithMany(v => v.Tasks)
            .HasForeignKey(t => t.RelatedVendorId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
