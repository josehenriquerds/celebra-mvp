using Celebre.Application.Common.Interfaces;
using Celebre.Application.Features.Checkins.DTOs;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Celebre.Application.Features.Checkins.Queries.GetCheckinsList;

public class GetCheckinsListHandler : IRequestHandler<GetCheckinsListQuery, Result<PagedResult<CheckinDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetCheckinsListHandler> _logger;

    public GetCheckinsListHandler(
        IApplicationDbContext context,
        ILogger<GetCheckinsListHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<PagedResult<CheckinDto>>> Handle(
        GetCheckinsListQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var query = _context.Checkins
                .Include(c => c.Guest)
                    .ThenInclude(g => g.Contact)
                .Where(c => c.EventId == request.EventId);

            // Apply filters
            if (request.AtGate.HasValue)
            {
                query = query.Where(c => c.AtGate == request.AtGate.Value);
            }

            var total = await query.CountAsync(cancellationToken);

            var checkinEntities = await query
                .OrderByDescending(c => c.Timestamp)
                .Skip((request.Page - 1) * request.Limit)
                .Take(request.Limit)
                .ToListAsync(cancellationToken);

            var checkins = checkinEntities.Select(c => new CheckinDto(
                c.Id,
                c.EventId,
                c.GuestId,
                c.AtGate,
                c.Timestamp,
                c.Guest != null
                    ? new CheckinGuestDto(
                        c.Guest.Id,
                        c.Guest.Contact.FullName,
                        c.Guest.Contact.Phone)
                    : null
            )).ToList();

            return Result<PagedResult<CheckinDto>>.Success(
                new PagedResult<CheckinDto>(checkins, total, request.Page, request.Limit));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching checkins for event {EventId}", request.EventId);
            return Result<PagedResult<CheckinDto>>.Failure("Error fetching checkins");
        }
    }
}
