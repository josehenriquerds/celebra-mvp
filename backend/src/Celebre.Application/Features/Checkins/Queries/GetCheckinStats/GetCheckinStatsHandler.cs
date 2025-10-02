using Celebre.Application.Common.Interfaces;
using Celebre.Application.Features.Checkins.DTOs;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Celebre.Application.Features.Checkins.Queries.GetCheckinStats;

public class GetCheckinStatsHandler : IRequestHandler<GetCheckinStatsQuery, Result<CheckinStatsDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetCheckinStatsHandler> _logger;

    public GetCheckinStatsHandler(
        IApplicationDbContext context,
        ILogger<GetCheckinStatsHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<CheckinStatsDto>> Handle(
        GetCheckinStatsQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var totalCheckins = await _context.Checkins
                .CountAsync(c => c.EventId == request.EventId, cancellationToken);

            var atGateCheckins = await _context.Checkins
                .CountAsync(c => c.EventId == request.EventId && c.AtGate, cancellationToken);

            var manualCheckins = await _context.Checkins
                .CountAsync(c => c.EventId == request.EventId && !c.AtGate, cancellationToken);

            var totalGuests = await _context.Guests
                .CountAsync(g => g.EventId == request.EventId, cancellationToken);

            var checkedInGuestIds = await _context.Checkins
                .Where(c => c.EventId == request.EventId)
                .Select(c => c.GuestId)
                .Distinct()
                .CountAsync(cancellationToken);

            var checkinRate = totalGuests > 0
                ? Math.Round((double)checkedInGuestIds / totalGuests * 100, 2)
                : 0;

            var stats = new CheckinStatsDto(
                totalCheckins,
                atGateCheckins,
                manualCheckins,
                totalGuests,
                checkedInGuestIds,
                checkinRate
            );

            return Result<CheckinStatsDto>.Success(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching checkin stats for event {EventId}", request.EventId);
            return Result<CheckinStatsDto>.Failure("Error fetching checkin stats");
        }
    }
}
