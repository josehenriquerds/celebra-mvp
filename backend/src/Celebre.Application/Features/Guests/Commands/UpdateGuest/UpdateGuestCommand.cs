using Celebre.Application.Features.Guests.DTOs;
using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Guests.Commands.UpdateGuest;

public record UpdateGuestCommand(
    string GuestId,
    string? Rsvp,
    int? Seats,
    int? Children,
    bool? TransportNeeded,
    bool? OptOut
) : IRequest<Result<GuestDto>>;

public record UpdateGuestRequest(
    string? Rsvp,
    int? Seats,
    int? Children,
    bool? TransportNeeded,
    bool? OptOut
);
