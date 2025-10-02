using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Gifts.Commands.DeleteGift;

public record DeleteGiftCommand(string GiftId) : IRequest<Result>;
