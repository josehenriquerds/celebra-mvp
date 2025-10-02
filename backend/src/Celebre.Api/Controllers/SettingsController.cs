using Celebre.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Celebre.Api.Controllers;

[ApiController]
[Route("api/events/{eventId}/settings")]
[Produces("application/json")]
public class SettingsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public SettingsController(IApplicationDbContext context) => _context = context;

    /// <summary>
    /// Get event settings (stub)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetSettings([FromRoute] string eventId)
    {
        var event_ = await _context.Events.FindAsync(eventId);
        if (event_ == null) return NotFound();

        // Return basic settings - can be expanded
        return Ok(new
        {
            eventId,
            settings = new
            {
                notifications = new { email = true, sms = true, whatsapp = true },
                privacy = new { publicEvent = false, allowGuestPlusOne = true },
                rsvp = new { deadline = event_.DateTime.AddDays(-7), allowChanges = true }
            }
        });
    }

    /// <summary>
    /// Update event settings (stub)
    /// </summary>
    [HttpPatch]
    public async Task<IActionResult> UpdateSettings([FromRoute] string eventId, [FromBody] object settings)
    {
        var event_ = await _context.Events.FindAsync(eventId);
        if (event_ == null) return NotFound();

        // In a full implementation, would save settings to a dedicated table or JSON column
        return Ok(new { message = "Settings updated", eventId, settings });
    }
}
