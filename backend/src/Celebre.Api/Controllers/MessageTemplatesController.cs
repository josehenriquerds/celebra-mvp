using Celebre.Application.Common.Interfaces;
using Celebre.Domain.Entities;
using Celebre.Shared;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Celebre.Api.Controllers;

[ApiController]
[Route("api")]
[Produces("application/json")]
public class MessageTemplatesController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public MessageTemplatesController(IApplicationDbContext context) => _context = context;

    /// <summary>
    /// Get all message templates for an event
    /// </summary>
    [HttpGet("events/{eventId}/message-templates")]
    public async Task<IActionResult> GetMessageTemplates([FromRoute] string eventId)
    {
        var templates = await _context.MessageTemplates
            .Where(t => t.EventId == eventId)
            .Select(t => new
            {
                t.Id,
                t.EventId,
                t.Name,
                t.ContentText,
                t.ContentButtons,
                t.Variables,
                t.Locale,
                t.CreatedAt
            })
            .ToListAsync();

        return Ok(new { messageTemplates = templates });
    }

    /// <summary>
    /// Create a message template
    /// </summary>
    [HttpPost("message-templates")]
    public async Task<IActionResult> CreateMessageTemplate([FromBody] CreateMessageTemplateRequest request)
    {
        var template = new MessageTemplate
        {
            Id = CuidGenerator.Generate(),
            EventId = request.EventId,
            Name = request.Name,
            ContentText = request.ContentText ?? "",
            ContentButtons = request.ContentButtons,
            Variables = request.Variables ?? new List<string>(),
            Locale = request.Locale ?? "pt_BR",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _context.MessageTemplates.AddAsync(template);
        await _context.SaveChangesAsync(default);

        return CreatedAtAction(nameof(GetMessageTemplates), new { eventId = request.EventId }, template);
    }

    /// <summary>
    /// Update a message template
    /// </summary>
    [HttpPatch("message-templates/{id}")]
    public async Task<IActionResult> UpdateMessageTemplate([FromRoute] string id, [FromBody] UpdateMessageTemplateRequest request)
    {
        var template = await _context.MessageTemplates.FindAsync(id);
        if (template == null) return NotFound();

        if (!string.IsNullOrEmpty(request.Name))
            template.Name = request.Name;
        if (!string.IsNullOrEmpty(request.ContentText))
            template.ContentText = request.ContentText;
        if (request.ContentButtons != null)
            template.ContentButtons = request.ContentButtons;

        template.UpdatedAt = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync(default);

        return Ok(template);
    }
}

public record CreateMessageTemplateRequest(string EventId, string Name, string? ContentText, string? ContentButtons, List<string>? Variables, string? Locale);
public record UpdateMessageTemplateRequest(string? Name, string? ContentText, string? ContentButtons);
