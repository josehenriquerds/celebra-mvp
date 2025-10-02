namespace Celebre.Domain.Entities;

public class VendorReview
{
    public string Id { get; set; } = string.Empty;
    public string VendorId { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public string? AuthorContactId { get; set; }
    public string? EventId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    // Navigation properties
    public VendorPartner Vendor { get; set; } = null!;
}
