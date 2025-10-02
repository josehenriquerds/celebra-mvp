using Celebre.Domain.Enums;

namespace Celebre.Domain.Entities;

public class VendorMedia
{
    public string Id { get; set; } = string.Empty;
    public string VendorId { get; set; } = string.Empty;
    public VendorMediaType Type { get; set; }
    public string Url { get; set; } = string.Empty;
    public int? Width { get; set; }
    public int? Height { get; set; }
    public string? Blurhash { get; set; }
    public string? Alt { get; set; }
    public int SortOrder { get; set; } = 0;

    // Navigation properties
    public VendorPartner Vendor { get; set; } = null!;
}
