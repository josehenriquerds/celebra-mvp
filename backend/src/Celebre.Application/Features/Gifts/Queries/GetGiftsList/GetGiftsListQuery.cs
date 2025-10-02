using Celebre.Application.Features.Gifts.DTOs;
using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Gifts.Queries.GetGiftsList;

public record GetGiftsListQuery(
    string EventId,
    string? Status,
    int Page = 1,
    int Limit = 50
) : IRequest<Result<PagedResult<GiftDto>>>;
