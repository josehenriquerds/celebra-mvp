using Celebre.Application.Features.Gifts.DTOs;
using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Gifts.Commands.CreateGift;

public record CreateGiftCommand(
    string EventId,
    string Title,
    string? Link,
    decimal? Price
) : IRequest<Result<GiftDto>>;

public record CreateGiftRequest(
    string EventId,
    string Title,
    string? Link,
    decimal? Price
);
