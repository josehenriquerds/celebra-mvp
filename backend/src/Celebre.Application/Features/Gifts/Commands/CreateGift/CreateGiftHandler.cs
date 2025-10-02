using Celebre.Application.Common.Interfaces;
using Celebre.Application.Features.Gifts.DTOs;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Celebre.Application.Features.Gifts.Commands.CreateGift;

public class CreateGiftHandler : IRequestHandler<CreateGiftCommand, Result<GiftDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<CreateGiftHandler> _logger;

    public CreateGiftHandler(
        IApplicationDbContext context,
        ILogger<CreateGiftHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<GiftDto>> Handle(
        CreateGiftCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var eventExists = await _context.Events
                .AnyAsync(e => e.Id == request.EventId, cancellationToken);

            if (!eventExists)
                return Result<GiftDto>.Failure("Event not found");

            var gift = new GiftRegistryItem
            {
                Id = CuidGenerator.Generate(),
                EventId = request.EventId,
                Title = request.Title,
                Link = request.Link,
                Price = request.Price,
                Status = GiftStatus.disponivel,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            await _context.GiftRegistryItems.AddAsync(gift, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            var dto = new GiftDto(
                gift.Id,
                gift.EventId,
                gift.Title,
                gift.Link,
                gift.Price,
                gift.Status.ToString(),
                null,
                null
            );

            return Result<GiftDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating gift for event {EventId}", request.EventId);
            return Result<GiftDto>.Failure("Error creating gift");
        }
    }
}
