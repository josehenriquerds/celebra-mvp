using Celebre.Domain.Enums;

namespace Celebre.Domain.Entities;

public class VendorPartner
{
    public string Id { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneE164 { get; set; } = string.Empty;
    public string? InstagramHandle { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? WhatsappUrl { get; set; }

    // Location
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = "BR";
    public int? ServiceRadiusKm { get; set; }

    // Business info
    public List<string> Categories { get; set; } = new();
    public int? PriceFromCents { get; set; }
    public string? DescriptionShort { get; set; }
    public string? DescriptionLong { get; set; }

    // Status & moderation
    public VendorPartnerStatus Status { get; set; } = VendorPartnerStatus.pending_review;
    public int ProfileScore { get; set; } = 0;

    // LGPD
    public string? ConsentText { get; set; }
    public DateTimeOffset? ConsentAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<VendorMedia> Media { get; set; } = new List<VendorMedia>();
    public ICollection<VendorReview> Reviews { get; set; } = new List<VendorReview>();
    public ICollection<VendorNote> Notes { get; set; } = new List<VendorNote>();
    public ICollection<VendorStatusLog> StatusLog { get; set; } = new List<VendorStatusLog>();
}
