using Celebre.Domain.Enums;

namespace Celebre.Domain.Entities;

public class Contact
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public ContactRelation Relation { get; set; }
    public string? Notes { get; set; }
    public string? RestrictionsJson { get; set; }
    public bool IsVip { get; set; }
    public string? HouseholdId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation properties
    public Household? Household { get; set; }
    public ICollection<Guest> Guests { get; set; } = new List<Guest>();
    public ICollection<Interaction> Interactions { get; set; } = new List<Interaction>();
    public ICollection<EngagementScore> EngagementScores { get; set; } = new List<EngagementScore>();
    public ICollection<ConsentLog> ConsentLogs { get; set; } = new List<ConsentLog>();
    public ICollection<GiftRegistryItem> GiftsPurchased { get; set; } = new List<GiftRegistryItem>();
}
