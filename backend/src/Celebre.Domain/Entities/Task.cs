using Celebre.Domain.Enums;

namespace Celebre.Domain.Entities;

public class Task
{
    public string Id { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? AssigneeUserId { get; set; }
    public DateTimeOffset? DueAt { get; set; }
    public Enums.TaskStatus Status { get; set; } = Enums.TaskStatus.aberta;
    public int? SlaHours { get; set; }
    public string? RelatedVendorId { get; set; }
    public string? Description { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation properties
    public Event Event { get; set; } = null!;
    public Vendor? RelatedVendor { get; set; }
}
