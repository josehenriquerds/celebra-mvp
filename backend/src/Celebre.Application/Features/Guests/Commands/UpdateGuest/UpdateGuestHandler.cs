using Celebre.Application.Common.Interfaces;
using Celebre.Application.Features.Guests.DTOs;
using Celebre.Domain.Enums;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Celebre.Application.Features.Guests.Commands.UpdateGuest;

public class UpdateGuestHandler : IRequestHandler<UpdateGuestCommand, Result<GuestDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<UpdateGuestHandler> _logger;

    public UpdateGuestHandler(
        IApplicationDbContext context,
        ILogger<UpdateGuestHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<GuestDto>> Handle(
        UpdateGuestCommand request,
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

            // Update fields if provided
            if (!string.IsNullOrEmpty(request.Rsvp))
            {
                guest.Rsvp = Enum.Parse<RsvpStatus>(request.Rsvp);
            }

            if (request.Seats.HasValue)
                guest.Seats = request.Seats.Value;

            if (request.Children.HasValue)
                guest.Children = request.Children.Value;

            if (request.TransportNeeded.HasValue)
                guest.TransportNeeded = request.TransportNeeded.Value;

            if (request.OptOut.HasValue)
                guest.OptOut = request.OptOut.Value;

            guest.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

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
            _logger.LogError(ex, "Error updating guest {GuestId}", request.GuestId);
            return Result<GuestDto>.Failure("Error updating guest");
        }
    }
}
