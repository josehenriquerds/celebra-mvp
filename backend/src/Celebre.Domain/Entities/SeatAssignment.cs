namespace Celebre.Domain.Entities;

public class SeatAssignment
{
    public string Id { get; set; } = string.Empty;
    public string GuestId { get; set; } = string.Empty;
    public string SeatId { get; set; } = string.Empty;
    public bool Locked { get; set; } = false;

    // Navigation properties
    public Guest Guest { get; set; } = null!;
    public Seat Seat { get; set; } = null!;
}
