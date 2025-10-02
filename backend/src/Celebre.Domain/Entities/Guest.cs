using Celebre.Domain.Enums;

namespace Celebre.Domain.Entities;

public class Guest
{
    public string Id { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public string ContactId { get; set; } = string.Empty;
    public InviteStatus InviteStatus { get; set; }
    public RsvpStatus Rsvp { get; set; }
    public int Seats { get; set; } = 1;
    public int Children { get; set; } = 0;
    public bool TransportNeeded { get; set; }
    public bool OptOut { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation properties
    public Event Event { get; set; } = null!;
    public Contact Contact { get; set; } = null!;
    public ICollection<GuestTag> Tags { get; set; } = new List<GuestTag>();
    public ICollection<SeatAssignment> SeatAssignments { get; set; } = new List<SeatAssignment>();
    public ICollection<Checkin> Checkins { get; set; } = new List<Checkin>();
}
