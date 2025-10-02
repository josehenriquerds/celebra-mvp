using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Tables.Commands.UnassignSeat;

public record UnassignSeatCommand(string SeatAssignmentId) : IRequest<Result>;
