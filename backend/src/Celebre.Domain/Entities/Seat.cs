namespace Celebre.Domain.Entities;

public class Seat
{
    public string Id { get; set; } = string.Empty;
    public string TableId { get; set; } = string.Empty;
    public int Index { get; set; }
    public double X { get; set; } = 0;
    public double Y { get; set; } = 0;
    public double Rotation { get; set; } = 0;

    // Navigation properties
    public Table Table { get; set; } = null!;
    public ICollection<SeatAssignment> Assignments { get; set; } = new List<SeatAssignment>();
}
