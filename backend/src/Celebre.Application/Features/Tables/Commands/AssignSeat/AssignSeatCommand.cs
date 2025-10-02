using Celebre.Application.Features.Tables.DTOs;
using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Tables.Commands.AssignSeat;

public record AssignSeatCommand(
    string TableId,
    string GuestId,
    int? SeatIndex,
    bool Locked = false
) : IRequest<Result<AssignSeatResult>>;

public record AssignSeatRequest(
    string GuestId,
    int? SeatIndex,
    bool Locked = false
);
