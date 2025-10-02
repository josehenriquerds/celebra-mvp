using Celebre.Application.Features.Checkins.DTOs;
using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Checkins.Queries.GetCheckinsList;

public record GetCheckinsListQuery(
    string EventId,
    bool? AtGate,
    int Page = 1,
    int Limit = 50
) : IRequest<Result<PagedResult<CheckinDto>>>;
