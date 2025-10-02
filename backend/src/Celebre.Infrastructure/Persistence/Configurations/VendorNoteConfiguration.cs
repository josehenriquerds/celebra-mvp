using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Celebre.Domain.Entities;

namespace Celebre.Infrastructure.Persistence.Configurations;

public class VendorNoteConfiguration : IEntityTypeConfiguration<VendorNote>
{
    public void Configure(EntityTypeBuilder<VendorNote> builder)
    {
        builder.ToTable("vendor_notes");

        // Primary Key
        builder.HasKey(vn => vn.Id);

        // Properties
        builder.Property(vn => vn.Id)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(vn => vn.VendorId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("vendor_id");

        builder.Property(vn => vn.AuthorUserId)
            .IsRequired()
            .HasMaxLength(255)
            .HasColumnName("author_user_id");

        builder.Property(vn => vn.NoteText)
            .IsRequired()
            .HasColumnType("text")
            .HasColumnName("note_text");

        builder.Property(vn => vn.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");

        // Indexes
        builder.HasIndex(vn => vn.VendorId);

        // Relationships
        builder.HasOne(vn => vn.Vendor)
            .WithMany(vp => vp.Notes)
            .HasForeignKey(vn => vn.VendorId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
