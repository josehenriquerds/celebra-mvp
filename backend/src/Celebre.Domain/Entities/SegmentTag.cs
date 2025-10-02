namespace Celebre.Domain.Entities;

public class SegmentTag
{
    public string Id { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string RuleJson { get; set; } = string.Empty;
    public bool IsDynamic { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation properties
    public Event Event { get; set; } = null!;
    public ICollection<GuestTag> Guests { get; set; } = new List<GuestTag>();
}
