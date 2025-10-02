namespace Celebre.Domain.Entities;

public class GuestTag
{
    public string GuestId { get; set; } = string.Empty;
    public string TagId { get; set; } = string.Empty;

    // Navigation properties
    public Guest Guest { get; set; } = null!;
    public SegmentTag Tag { get; set; } = null!;
}
