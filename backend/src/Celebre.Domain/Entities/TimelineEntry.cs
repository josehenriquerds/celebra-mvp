using Celebre.Domain.Enums;

namespace Celebre.Domain.Entities;

public class TimelineEntry
{
    public string Id { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public ActorType ActorType { get; set; }
    public TimelineType Type { get; set; }
    public string? RefId { get; set; }
    public DateTimeOffset OccurredAt { get; set; }
    public string? MetaJson { get; set; }

    // Navigation properties
    public Event Event { get; set; } = null!;
}
