using Celebre.Application.Common.Interfaces;
using Celebre.Application.Features.Gifts.DTOs;
using Celebre.Domain.Enums;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Celebre.Application.Features.Gifts.Commands.UpdateGift;

public class UpdateGiftHandler : IRequestHandler<UpdateGiftCommand, Result<GiftDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<UpdateGiftHandler> _logger;

    public UpdateGiftHandler(
        IApplicationDbContext context,
        ILogger<UpdateGiftHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<GiftDto>> Handle(
        UpdateGiftCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var gift = await _context.GiftRegistryItems
                .Include(g => g.BuyerContact)
                .FirstOrDefaultAsync(g => g.Id == request.GiftId, cancellationToken);

            if (gift == null)
                return Result<GiftDto>.Failure("Gift not found");

            if (!string.IsNullOrEmpty(request.Status))
            {
                if (Enum.TryParse<GiftStatus>(request.Status, out var status))
                {
                    gift.Status = status;
                }
            }

            if (!string.IsNullOrEmpty(request.BuyerContactId))
            {
                var contactExists = await _context.Contacts
                    .AnyAsync(c => c.Id == request.BuyerContactId, cancellationToken);

                if (contactExists)
                {
                    gift.BuyerContactId = request.BuyerContactId;
                }
            }

            gift.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);

            var dto = new GiftDto(
                gift.Id,
                gift.EventId,
                gift.Title,
                gift.Link,
                gift.Price,
                gift.Status.ToString(),
                gift.BuyerContactId,
                gift.BuyerContact?.FullName
            );

            return Result<GiftDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating gift {GiftId}", request.GiftId);
            return Result<GiftDto>.Failure("Error updating gift");
        }
    }
}
