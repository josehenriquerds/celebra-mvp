using Celebre.Application.Common.Interfaces;
using Celebre.Application.Features.Guests.DTOs;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Celebre.Application.Features.Guests.Queries.GetGuestById;

public class GetGuestByIdHandler : IRequestHandler<GetGuestByIdQuery, Result<GuestDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetGuestByIdHandler> _logger;

    public GetGuestByIdHandler(
        IApplicationDbContext context,
        ILogger<GetGuestByIdHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<GuestDto>> Handle(
        GetGuestByIdQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var guest = await _context.Guests
                .Include(g => g.Contact)
                    .ThenInclude(c => c.Household)
                .Include(g => g.Contact)
                    .ThenInclude(c => c.EngagementScores)
                .Include(g => g.SeatAssignments)
                    .ThenInclude(sa => sa.Seat)
                    .ThenInclude(s => s.Table)
                .Include(g => g.Tags)
                    .ThenInclude(gt => gt.Tag)
                .FirstOrDefaultAsync(g => g.Id == request.GuestId, cancellationToken);

            if (guest == null)
                return Result<GuestDto>.Failure("Guest not found");

            var dto = new GuestDto(
                guest.Id,
                guest.EventId,
                new ContactDto(
                    guest.Contact.Id,
                    guest.Contact.FullName,
                    guest.Contact.Phone,
                    guest.Contact.Email,
                    guest.Contact.Relation.ToString(),
                    guest.Contact.IsVip,
                    guest.Contact.RestrictionsJson != null
                        ? JsonSerializer.Deserialize<object>(guest.Contact.RestrictionsJson)
                        : null
                ),
                guest.Contact.Household != null
                    ? new HouseholdDto(
                        guest.Contact.Household.Id,
                        guest.Contact.Household.Label,
                        guest.Contact.Household.SizeCached)
                    : null,
                guest.InviteStatus.ToString(),
                guest.Rsvp.ToString(),
                guest.Seats,
                guest.Children,
                guest.TransportNeeded,
                guest.OptOut,
                guest.Contact.EngagementScores.FirstOrDefault(es => es.EventId == guest.EventId) != null
                    ? new EngagementScoreDto(
                        guest.Contact.EngagementScores.First(es => es.EventId == guest.EventId).Value,
                        guest.Contact.EngagementScores.First(es => es.EventId == guest.EventId).Tier.ToString())
                    : null,
                guest.SeatAssignments.FirstOrDefault() != null
                    ? new TableInfoDto(
                        guest.SeatAssignments.First().Seat.Table.Id,
                        guest.SeatAssignments.First().Seat.Table.Label)
                    : null,
                guest.Tags.Select(gt => new TagDto(gt.Tag.Id, gt.Tag.Name)).ToList()
            );

            return Result<GuestDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching guest {GuestId}", request.GuestId);
            return Result<GuestDto>.Failure("Error fetching guest");
        }
    }
}
