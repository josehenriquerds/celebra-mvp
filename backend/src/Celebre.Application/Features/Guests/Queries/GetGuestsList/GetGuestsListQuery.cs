using Celebre.Application.Features.Guests.DTOs;
using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Guests.Queries.GetGuestsList;

public record GetGuestsListQuery(
    string EventId,
    string? Filter,
    string? Search,
    int Page = 1,
    int Limit = 50
) : IRequest<Result<PagedResult<GuestDto>>>;
