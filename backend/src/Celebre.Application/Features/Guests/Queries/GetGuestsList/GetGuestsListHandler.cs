using Celebre.Application.Common.Interfaces;
using Celebre.Application.Features.Guests.DTOs;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Celebre.Application.Features.Guests.Queries.GetGuestsList;

public class GetGuestsListHandler : IRequestHandler<GetGuestsListQuery, Result<PagedResult<GuestDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetGuestsListHandler> _logger;

    public GetGuestsListHandler(
        IApplicationDbContext context,
        ILogger<GetGuestsListHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<PagedResult<GuestDto>>> Handle(
        GetGuestsListQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var query = _context.Guests
                .Include(g => g.Contact)
                    .ThenInclude(c => c.Household)
                .Include(g => g.Contact)
                    .ThenInclude(c => c.EngagementScores.Where(es => es.EventId == request.EventId))
                .Include(g => g.SeatAssignments)
                    .ThenInclude(sa => sa.Seat)
                    .ThenInclude(s => s.Table)
                .Include(g => g.Tags)
                    .ThenInclude(gt => gt.Tag)
                .Where(g => g.EventId == request.EventId);

            // Apply filters
            query = ApplyFilters(query, request.Filter, request.Search);

            var total = await query.CountAsync(cancellationToken);

            // Fetch entities first, then map to DTOs (to allow JsonSerializer usage)
            var guestEntities = await query
                .OrderByDescending(g => g.Contact.IsVip)
                .ThenBy(g => g.Rsvp)
                .ThenBy(g => g.Contact.FullName)
                .Skip((request.Page - 1) * request.Limit)
                .Take(request.Limit)
                .ToListAsync(cancellationToken);

            var guests = guestEntities.Select(g => new GuestDto(
                g.Id,
                g.EventId,
                new ContactDto(
                    g.Contact.Id,
                    g.Contact.FullName,
                    g.Contact.Phone,
                    g.Contact.Email,
                    g.Contact.Relation.ToString(),
                    g.Contact.IsVip,
                    g.Contact.RestrictionsJson != null
                        ? JsonSerializer.Deserialize<object>(g.Contact.RestrictionsJson)
                        : null
                ),
                g.Contact.Household != null
                    ? new HouseholdDto(
                        g.Contact.Household.Id,
                        g.Contact.Household.Label,
                        g.Contact.Household.SizeCached)
                    : null,
                g.InviteStatus.ToString(),
                g.Rsvp.ToString(),
                g.Seats,
                g.Children,
                g.TransportNeeded,
                g.OptOut,
                g.Contact.EngagementScores.FirstOrDefault() != null
                    ? new EngagementScoreDto(
                        g.Contact.EngagementScores.First().Value,
                        g.Contact.EngagementScores.First().Tier.ToString())
                    : null,
                g.SeatAssignments.FirstOrDefault() != null
                    ? new TableInfoDto(
                        g.SeatAssignments.First().Seat.Table.Id,
                        g.SeatAssignments.First().Seat.Table.Label)
                    : null,
                g.Tags.Select(gt => new TagDto(gt.Tag.Id, gt.Tag.Name)).ToList()
            )).ToList();

            return Result<PagedResult<GuestDto>>.Success(
                new PagedResult<GuestDto>(guests, total, request.Page, request.Limit));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching guests for event {EventId}", request.EventId);
            return Result<PagedResult<GuestDto>>.Failure("Error fetching guests");
        }
    }

    private IQueryable<Domain.Entities.Guest> ApplyFilters(
        IQueryable<Domain.Entities.Guest> query,
        string? filter,
        string? search)
    {
        if (!string.IsNullOrEmpty(filter))
        {
            query = filter switch
            {
                "vip" => query.Where(g => g.Contact.IsVip),
                "children" => query.Where(g => g.Children > 0),
                "pending" => query.Where(g => g.Rsvp == Domain.Enums.RsvpStatus.pendente),
                "confirmed" => query.Where(g => g.Rsvp == Domain.Enums.RsvpStatus.sim),
                "no_phone" => query.Where(g => string.IsNullOrEmpty(g.Contact.Phone)),
                _ => query
            };
        }

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(g =>
                g.Contact.FullName.Contains(search) ||
                g.Contact.Phone.Contains(search) ||
                (g.Contact.Email != null && g.Contact.Email.Contains(search))
            );
        }

        return query;
    }
}
