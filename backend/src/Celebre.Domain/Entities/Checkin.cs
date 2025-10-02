namespace Celebre.Domain.Entities;

public class Checkin
{
    public string Id { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public string GuestId { get; set; } = string.Empty;
    public bool AtGate { get; set; } = true;
    public DateTimeOffset Timestamp { get; set; }

    // Navigation properties
    public Event Event { get; set; } = null!;
    public Guest Guest { get; set; } = null!;
}
