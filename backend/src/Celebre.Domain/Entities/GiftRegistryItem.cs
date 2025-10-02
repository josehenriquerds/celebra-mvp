using Celebre.Domain.Enums;

namespace Celebre.Domain.Entities;

public class GiftRegistryItem
{
    public string Id { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Link { get; set; }
    public decimal? Price { get; set; }
    public GiftStatus Status { get; set; } = GiftStatus.disponivel;
    public string? BuyerContactId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation properties
    public Event Event { get; set; } = null!;
    public Contact? BuyerContact { get; set; }
}
