using Celebre.Domain.Enums;

namespace Celebre.Domain.Entities;

public class Interaction
{
    public string Id { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public string ContactId { get; set; } = string.Empty;
    public Channel Channel { get; set; }
    public InteractionKind Kind { get; set; }
    public string PayloadJson { get; set; } = string.Empty;
    public DateTimeOffset OccurredAt { get; set; }

    // Navigation properties
    public Event Event { get; set; } = null!;
    public Contact Contact { get; set; } = null!;
}
