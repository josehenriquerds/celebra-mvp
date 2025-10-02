using Celebre.Application.Common.Interfaces;
using Celebre.Domain.Entities;
using Celebre.Shared;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Celebre.Api.Controllers;

[ApiController]
[Route("api")]
[Produces("application/json")]
public class SegmentsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public SegmentsController(IApplicationDbContext context) => _context = context;

    /// <summary>
    /// Get all segments (tags) for an event
    /// </summary>
    [HttpGet("events/{eventId}/segments")]
    public async Task<IActionResult> GetSegments([FromRoute] string eventId)
    {
        var segments = await _context.SegmentTags
            .Where(s => s.EventId == eventId)
            .Select(s => new
            {
                s.Id,
                s.EventId,
                s.Name,
                s.RuleJson,
                s.IsDynamic,
                s.CreatedAt
            })
            .ToListAsync();

        return Ok(new { segments });
    }

    /// <summary>
    /// Create a new segment
    /// </summary>
    [HttpPost("segments")]
    public async Task<IActionResult> CreateSegment([FromBody] CreateSegmentRequest request)
    {
        var segment = new SegmentTag
        {
            Id = CuidGenerator.Generate(),
            EventId = request.EventId,
            Name = request.Name,
            RuleJson = request.RuleJson ?? "{}",
            IsDynamic = request.IsDynamic,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _context.SegmentTags.AddAsync(segment);
        await _context.SaveChangesAsync(default);

        return CreatedAtAction(nameof(GetSegments), new { eventId = request.EventId }, segment);
    }

    /// <summary>
    /// Update a segment
    /// </summary>
    [HttpPatch("segments/{id}")]
    public async Task<IActionResult> UpdateSegment([FromRoute] string id, [FromBody] UpdateSegmentRequest request)
    {
        var segment = await _context.SegmentTags.FindAsync(id);
        if (segment == null) return NotFound();

        if (!string.IsNullOrEmpty(request.Name))
            segment.Name = request.Name;
        if (!string.IsNullOrEmpty(request.RuleJson))
            segment.RuleJson = request.RuleJson;

        segment.UpdatedAt = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync(default);

        return Ok(segment);
    }

    /// <summary>
    /// Delete a segment
    /// </summary>
    [HttpDelete("segments/{id}")]
    public async Task<IActionResult> DeleteSegment([FromRoute] string id)
    {
        var segment = await _context.SegmentTags.FindAsync(id);
        if (segment == null) return NotFound();

        _context.SegmentTags.Remove(segment);
        await _context.SaveChangesAsync(default);

        return NoContent();
    }

    /// <summary>
    /// Send message to segment (stub)
    /// </summary>
    [HttpPost("segments/{id}/send")]
    public async Task<IActionResult> SendToSegment([FromRoute] string id, [FromBody] SendSegmentMessageRequest request)
    {
        var segment = await _context.SegmentTags
            .Include(s => s.Guests)
            .ThenInclude(gt => gt.Guest)
            .ThenInclude(g => g.Contact)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (segment == null) return NotFound();

        // TODO: Implement actual messaging logic
        var guestCount = segment.Guests.Count;

        return Ok(new { message = "Messages queued", recipientCount = guestCount });
    }
}

public record CreateSegmentRequest(string EventId, string Name, string? RuleJson, bool IsDynamic = true);
public record UpdateSegmentRequest(string? Name, string? RuleJson);
public record SendSegmentMessageRequest(string? MessageTemplateId, string? Message);
