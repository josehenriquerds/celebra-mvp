using Celebre.Domain.Enums;

namespace Celebre.Domain.Entities;

public class EngagementScore
{
    public string ContactId { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public int Value { get; set; } = 0;
    public EngagementTier Tier { get; set; } = EngagementTier.bronze;
    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation properties
    public Contact Contact { get; set; } = null!;
    public Event Event { get; set; } = null!;
}
