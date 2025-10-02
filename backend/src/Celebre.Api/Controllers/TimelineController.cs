using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Celebre.Application.Common.Interfaces;

namespace Celebre.Api.Controllers;

[ApiController]
[Route("api/events/{eventId}/timeline")]
[Produces("application/json")]
public class TimelineController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public TimelineController(IApplicationDbContext context) => _context = context;

    /// <summary>
    /// Get timeline entries for an event
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetTimeline([FromRoute] string eventId)
    {
        var entries = await _context.TimelineEntries
            .Where(t => t.EventId == eventId)
            .OrderByDescending(t => t.OccurredAt)
            .Select(t => new
            {
                t.Id,
                t.EventId,
                ActorType = t.ActorType.ToString(),
                Type = t.Type.ToString(),
                t.RefId,
                t.MetaJson,
                t.OccurredAt
            })
            .ToListAsync();

        return Ok(new { timeline = entries });
    }
}
