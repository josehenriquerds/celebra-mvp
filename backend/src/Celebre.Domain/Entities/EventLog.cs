namespace Celebre.Domain.Entities;

public class EventLog
{
    public string Id { get; set; } = string.Empty;
    public string? EventId { get; set; }
    public string Source { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string PayloadJson { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }

    // Navigation properties
    public Event? Event { get; set; }
}
