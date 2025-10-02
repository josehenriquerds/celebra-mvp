using Celebre.Application.Common.Interfaces;
using Celebre.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Celebre.Api.Controllers;

[ApiController]
[Route("api/events/{eventId}/reports")]
[Produces("application/json")]
public class ReportsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public ReportsController(IApplicationDbContext context) => _context = context;

    /// <summary>
    /// Get event statistics
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats([FromRoute] string eventId)
    {
        var totalGuests = await _context.Guests.CountAsync(g => g.EventId == eventId);
        var confirmed = await _context.Guests.CountAsync(g => g.EventId == eventId && g.Rsvp == RsvpStatus.sim);
        var pending = await _context.Guests.CountAsync(g => g.EventId == eventId && g.Rsvp == RsvpStatus.pendente);
        var declined = await _context.Guests.CountAsync(g => g.EventId == eventId && g.Rsvp == RsvpStatus.nao);
        var totalCheckins = await _context.Checkins.CountAsync(c => c.EventId == eventId);
        var totalTables = await _context.Tables.CountAsync(t => t.EventId == eventId);
        var totalSeats = await _context.Tables.Where(t => t.EventId == eventId).SumAsync(t => t.Capacity);
        var assignedSeats = await _context.SeatAssignments.CountAsync(sa => sa.Seat.Table.EventId == eventId);

        return Ok(new
        {
            totalGuests,
            confirmed,
            pending,
            declined,
            confirmationRate = totalGuests > 0 ? Math.Round((double)confirmed / totalGuests * 100, 2) : 0,
            totalCheckins,
            checkinRate = totalGuests > 0 ? Math.Round((double)totalCheckins / totalGuests * 100, 2) : 0,
            totalTables,
            totalSeats,
            assignedSeats,
            availableSeats = totalSeats - assignedSeats
        });
    }

    /// <summary>
    /// Get budget report (stub)
    /// </summary>
    [HttpGet("budget")]
    public async Task<IActionResult> GetBudgetReport([FromRoute] string eventId)
    {
        var event_ = await _context.Events.FindAsync(eventId);
        if (event_ == null) return NotFound();

        var giftsTotal = await _context.GiftRegistryItems
            .Where(g => g.EventId == eventId && g.Price.HasValue)
            .SumAsync(g => g.Price!.Value);

        return Ok(new
        {
            budgetTotal = event_.BudgetTotal,
            giftsTotal,
            remaining = event_.BudgetTotal - giftsTotal
        });
    }

    /// <summary>
    /// Get engagement report (stub)
    /// </summary>
    [HttpGet("engagement")]
    public async Task<IActionResult> GetEngagementReport([FromRoute] string eventId)
    {
        var avgScore = await _context.EngagementScores
            .Where(e => e.EventId == eventId)
            .AverageAsync(e => (double?)e.Value) ?? 0;

        var tierCounts = await _context.EngagementScores
            .Where(e => e.EventId == eventId)
            .GroupBy(e => e.Tier)
            .Select(g => new { Tier = g.Key.ToString(), Count = g.Count() })
            .ToListAsync();

        return Ok(new
        {
            averageScore = Math.Round(avgScore, 2),
            tierDistribution = tierCounts
        });
    }
}
