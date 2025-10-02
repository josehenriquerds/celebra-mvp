using Celebre.Application.Features.Tables.DTOs;
using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Tables.Commands.AutoAssignSeats;

public record AutoAssignSeatsCommand(string EventId) : IRequest<Result<AutoSeatResult>>;
