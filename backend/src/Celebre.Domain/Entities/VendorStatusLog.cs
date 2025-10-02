using Celebre.Domain.Enums;

namespace Celebre.Domain.Entities;

public class VendorStatusLog
{
    public string Id { get; set; } = string.Empty;
    public string VendorId { get; set; } = string.Empty;
    public VendorStatusAction Action { get; set; }
    public string? ActorUserId { get; set; }
    public string? Reason { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    // Navigation properties
    public VendorPartner Vendor { get; set; } = null!;
}
