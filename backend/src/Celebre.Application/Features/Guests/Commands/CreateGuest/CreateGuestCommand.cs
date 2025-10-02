using Celebre.Application.Features.Guests.DTOs;
using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Guests.Commands.CreateGuest;

public record CreateGuestCommand(
    string EventId,
    string ContactId,
    int Seats = 1,
    int Children = 0,
    bool TransportNeeded = false
) : IRequest<Result<GuestDto>>;

public record CreateGuestRequest(
    string ContactId,
    int Seats = 1,
    int Children = 0,
    bool TransportNeeded = false
);
