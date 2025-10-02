using Celebre.Application.Features.Checkins.DTOs;
using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Checkins.Commands.UpdateCheckin;

public record UpdateCheckinCommand(
    string CheckinId,
    bool? AtGate
) : IRequest<Result<CheckinDto>>;

public record UpdateCheckinRequest(
    bool? AtGate
);
