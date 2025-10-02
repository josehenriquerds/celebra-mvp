using Celebre.Domain.Enums;

namespace Celebre.Domain.Entities;

public class Vendor
{
    public string Id { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal? ContractValue { get; set; }
    public VendorStatus Status { get; set; } = VendorStatus.ativo;
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation properties
    public Event Event { get; set; } = null!;
    public ICollection<Task> Tasks { get; set; } = new List<Task>();
}
