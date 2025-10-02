using Celebre.Application.Common.Interfaces;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;
using Celebre.Shared;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Celebre.Api.Controllers;

[ApiController]
[Route("api")]
[Produces("application/json")]
public class EngagementController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public EngagementController(IApplicationDbContext context) => _context = context;

    /// <summary>
    /// Get engagement scores for an event
    /// </summary>
    [HttpGet("events/{eventId}/engagement")]
    public async Task<IActionResult> GetEngagement([FromRoute] string eventId)
    {
        var scores = await _context.EngagementScores
            .Include(e => e.Contact)
            .Where(e => e.EventId == eventId)
            .OrderByDescending(e => e.Value)
            .Select(e => new
            {
                e.EventId,
                e.ContactId,
                ContactName = e.Contact.FullName,
                e.Value,
                Tier = e.Tier.ToString(),
                e.UpdatedAt
            })
            .ToListAsync();

        return Ok(new { engagementScores = scores });
    }

    /// <summary>
    /// Record an interaction
    /// </summary>
    [HttpPost("interactions")]
    public async Task<IActionResult> CreateInteraction([FromBody] CreateInteractionRequest request)
    {
        var interaction = new Interaction
        {
            Id = CuidGenerator.Generate(),
            EventId = request.EventId,
            ContactId = request.ContactId,
            Channel = Channel.whatsapp,
            Kind = InteractionKind.mensagem,
            PayloadJson = request.DetailsJson ?? "{}",
            OccurredAt = DateTimeOffset.UtcNow
        };

        await _context.Interactions.AddAsync(interaction);

        // Update engagement score (simplified logic)
        var score = await _context.EngagementScores
            .FirstOrDefaultAsync(e => e.EventId == request.EventId && e.ContactId == request.ContactId);

        if (score != null)
        {
            score.Value += request.Type switch
            {
                "mensagem_enviada" => 1,
                "mensagem_lida" => 2,
                "resposta_recebida" => 5,
                "confirmação" => 10,
                _ => 0
            };
            score.UpdatedAt = DateTimeOffset.UtcNow;
        }
        else
        {
            score = new EngagementScore
            {
                EventId = request.EventId,
                ContactId = request.ContactId,
                Value = 1,
                Tier = EngagementTier.bronze,
                UpdatedAt = DateTimeOffset.UtcNow
            };
            await _context.EngagementScores.AddAsync(score);
        }

        await _context.SaveChangesAsync(default);

        return CreatedAtAction(nameof(GetEngagement), new { eventId = request.EventId }, interaction);
    }
}

public record CreateInteractionRequest(string EventId, string ContactId, string Type, string? MessageId, string? DetailsJson);
