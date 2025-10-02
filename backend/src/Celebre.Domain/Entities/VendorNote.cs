namespace Celebre.Domain.Entities;

public class VendorNote
{
    public string Id { get; set; } = string.Empty;
    public string VendorId { get; set; } = string.Empty;
    public string AuthorUserId { get; set; } = string.Empty;
    public string NoteText { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }

    // Navigation properties
    public VendorPartner Vendor { get; set; } = null!;
}
