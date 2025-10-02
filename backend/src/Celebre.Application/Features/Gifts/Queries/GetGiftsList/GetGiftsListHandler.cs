using Celebre.Application.Common.Interfaces;
using Celebre.Application.Features.Gifts.DTOs;
using Celebre.Domain.Enums;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Celebre.Application.Features.Gifts.Queries.GetGiftsList;

public class GetGiftsListHandler : IRequestHandler<GetGiftsListQuery, Result<PagedResult<GiftDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetGiftsListHandler> _logger;

    public GetGiftsListHandler(
        IApplicationDbContext context,
        ILogger<GetGiftsListHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<PagedResult<GiftDto>>> Handle(
        GetGiftsListQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var query = _context.GiftRegistryItems
                .Include(g => g.BuyerContact)
                .Where(g => g.EventId == request.EventId);

            if (!string.IsNullOrEmpty(request.Status))
            {
                if (Enum.TryParse<GiftStatus>(request.Status, out var status))
                {
                    query = query.Where(g => g.Status == status);
                }
            }

            var total = await query.CountAsync(cancellationToken);

            var giftEntities = await query
                .OrderBy(g => g.Title)
                .Skip((request.Page - 1) * request.Limit)
                .Take(request.Limit)
                .ToListAsync(cancellationToken);

            var gifts = giftEntities.Select(g => new GiftDto(
                g.Id,
                g.EventId,
                g.Title,
                g.Link,
                g.Price,
                g.Status.ToString(),
                g.BuyerContactId,
                g.BuyerContact?.FullName
            )).ToList();

            return Result<PagedResult<GiftDto>>.Success(
                new PagedResult<GiftDto>(gifts, total, request.Page, request.Limit));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching gifts for event {EventId}", request.EventId);
            return Result<PagedResult<GiftDto>>.Failure("Error fetching gifts");
        }
    }
}
