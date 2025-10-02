namespace Celebre.Domain.Entities;

public class Household
{
    public string Id { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public int SizeCached { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<Contact> Contacts { get; set; } = new List<Contact>();
}
