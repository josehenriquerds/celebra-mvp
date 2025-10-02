using Celebre.Application.Features.Checkins.DTOs;
using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Checkins.Commands.CreateCheckin;

public record CreateCheckinCommand(
    string EventId,
    string GuestId,
    bool AtGate = true
) : IRequest<Result<CheckinDto>>;

public record CreateCheckinRequest(
    string GuestId,
    bool AtGate = true
);
