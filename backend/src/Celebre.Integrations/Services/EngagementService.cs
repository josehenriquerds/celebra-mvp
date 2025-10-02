using Celebre.Application.Common.Interfaces;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;
using Celebre.Shared;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Celebre.Integrations.Services;

public interface IEngagementService
{
    Task<Result> IncrementScoreAsync(string contactId, string eventId, int points, CancellationToken cancellationToken = default);
    Task<Result> DecrementScoreAsync(string contactId, string eventId, int points, CancellationToken cancellationToken = default);
    Task<Result<EngagementTier>> RecalculateTierAsync(string contactId, string eventId, CancellationToken cancellationToken = default);
}

public class EngagementService : IEngagementService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<EngagementService> _logger;

    public EngagementService(
        IApplicationDbContext context,
        ILogger<EngagementService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result> IncrementScoreAsync(string contactId, string eventId, int points, CancellationToken cancellationToken = default)
    {
        try
        {
            var score = await _context.EngagementScores
                .FirstOrDefaultAsync(s => s.ContactId == contactId && s.EventId == eventId, cancellationToken);

            if (score == null)
            {
                score = new EngagementScore
                {
                    ContactId = contactId,
                    EventId = eventId,
                    Value = points,
                    Tier = CalculateTier(points),
                    UpdatedAt = DateTimeOffset.UtcNow
                };
                _context.EngagementScores.Add(score);
            }
            else
            {
                score.Value += points;
                score.Tier = CalculateTier(score.Value);
                score.UpdatedAt = DateTimeOffset.UtcNow;
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Incremented engagement score for Contact {ContactId} in Event {EventId} by {Points} points. New score: {NewScore}, Tier: {Tier}",
                contactId, eventId, points, score.Value, score.Tier);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error incrementing engagement score for Contact {ContactId} in Event {EventId}", contactId, eventId);
            return Result.Failure("Failed to increment engagement score");
        }
    }

    public async Task<Result> DecrementScoreAsync(string contactId, string eventId, int points, CancellationToken cancellationToken = default)
    {
        try
        {
            var score = await _context.EngagementScores
                .FirstOrDefaultAsync(s => s.ContactId == contactId && s.EventId == eventId, cancellationToken);

            if (score == null)
            {
                score = new EngagementScore
                {
                    ContactId = contactId,
                    EventId = eventId,
                    Value = Math.Max(0, -points),
                    Tier = CalculateTier(Math.Max(0, -points)),
                    UpdatedAt = DateTimeOffset.UtcNow
                };
                _context.EngagementScores.Add(score);
            }
            else
            {
                score.Value = Math.Max(0, score.Value - points);
                score.Tier = CalculateTier(score.Value);
                score.UpdatedAt = DateTimeOffset.UtcNow;
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Decremented engagement score for Contact {ContactId} in Event {EventId} by {Points} points. New score: {NewScore}, Tier: {Tier}",
                contactId, eventId, points, score.Value, score.Tier);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error decrementing engagement score for Contact {ContactId} in Event {EventId}", contactId, eventId);
            return Result.Failure("Failed to decrement engagement score");
        }
    }

    public async Task<Result<EngagementTier>> RecalculateTierAsync(string contactId, string eventId, CancellationToken cancellationToken = default)
    {
        try
        {
            var score = await _context.EngagementScores
                .FirstOrDefaultAsync(s => s.ContactId == contactId && s.EventId == eventId, cancellationToken);

            if (score == null)
            {
                _logger.LogWarning("Engagement score not found for Contact {ContactId} in Event {EventId}", contactId, eventId);
                return Result<EngagementTier>.Failure("Engagement score not found");
            }

            var newTier = CalculateTier(score.Value);
            var oldTier = score.Tier;

            if (newTier != oldTier)
            {
                score.Tier = newTier;
                score.UpdatedAt = DateTimeOffset.UtcNow;
                await _context.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Tier changed for Contact {ContactId} in Event {EventId} from {OldTier} to {NewTier}",
                    contactId, eventId, oldTier, newTier);
            }

            return Result<EngagementTier>.Success(newTier);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recalculating tier for Contact {ContactId} in Event {EventId}", contactId, eventId);
            return Result<EngagementTier>.Failure("Failed to recalculate tier");
        }
    }

    private static EngagementTier CalculateTier(int value)
    {
        return value switch
        {
            < 25 => EngagementTier.bronze,
            >= 25 and < 50 => EngagementTier.prata,
            _ => EngagementTier.ouro
        };
    }
}
