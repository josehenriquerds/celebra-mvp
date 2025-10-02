using Celebre.Domain.Enums;

namespace Celebre.Domain.Entities;

public class Table
{
    public string Id { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string? Zone { get; set; }
    public double X { get; set; } = 0;
    public double Y { get; set; } = 0;
    public double Rotation { get; set; } = 0;
    public TableShape Shape { get; set; } = TableShape.round;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation properties
    public Event Event { get; set; } = null!;
    public ICollection<Seat> Seats { get; set; } = new List<Seat>();
}
