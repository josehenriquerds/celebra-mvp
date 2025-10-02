using Celebre.Application.Features.Checkins.DTOs;
using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Checkins.Queries.GetCheckinStats;

public record GetCheckinStatsQuery(string EventId) : IRequest<Result<CheckinStatsDto>>;
