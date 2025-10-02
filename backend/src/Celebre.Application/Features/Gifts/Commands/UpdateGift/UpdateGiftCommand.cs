using Celebre.Application.Features.Gifts.DTOs;
using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Gifts.Commands.UpdateGift;

public record UpdateGiftCommand(
    string GiftId,
    string? Status,
    string? BuyerContactId
) : IRequest<Result<GiftDto>>;

public record UpdateGiftRequest(
    string? Status,
    string? BuyerContactId
);
