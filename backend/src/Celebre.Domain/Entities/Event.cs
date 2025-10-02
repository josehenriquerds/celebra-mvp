namespace Celebre.Domain.Entities;

public class Event
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTimeOffset DateTime { get; set; }
    public string VenueName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal BudgetTotal { get; set; }
    public List<string> Hosts { get; set; } = new();
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<Guest> Guests { get; set; } = new List<Guest>();
    public ICollection<Task> Tasks { get; set; } = new List<Task>();
    public ICollection<Vendor> Vendors { get; set; } = new List<Vendor>();
    public ICollection<GiftRegistryItem> GiftRegistryItems { get; set; } = new List<GiftRegistryItem>();
    public ICollection<Table> Tables { get; set; } = new List<Table>();
    public ICollection<TimelineEntry> TimelineEntries { get; set; } = new List<TimelineEntry>();
    public ICollection<MessageTemplate> MessageTemplates { get; set; } = new List<MessageTemplate>();
    public ICollection<EventLog> EventLogs { get; set; } = new List<EventLog>();
    public ICollection<SegmentTag> SegmentTags { get; set; } = new List<SegmentTag>();
    public ICollection<Interaction> Interactions { get; set; } = new List<Interaction>();
    public ICollection<EngagementScore> EngagementScores { get; set; } = new List<EngagementScore>();
    public ICollection<Checkin> Checkins { get; set; } = new List<Checkin>();
}
