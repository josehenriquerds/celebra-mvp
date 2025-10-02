namespace Celebre.Domain.Entities;

public class MessageTemplate
{
    public string Id { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public List<string> Variables { get; set; } = new();
    public string ContentText { get; set; } = string.Empty;
    public string? ContentButtons { get; set; }
    public string Locale { get; set; } = "pt_BR";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation properties
    public Event Event { get; set; } = null!;
}
