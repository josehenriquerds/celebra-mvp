using Celebre.Domain.Enums;

namespace Celebre.Domain.Entities;

public class ConsentLog
{
    public string Id { get; set; } = string.Empty;
    public string ContactId { get; set; } = string.Empty;
    public ConsentSource Source { get; set; }
    public ConsentAction Action { get; set; }
    public string? Text { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    // Navigation properties
    public Contact Contact { get; set; } = null!;
}
