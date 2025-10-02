using Celebre.Application.Common.Interfaces;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Celebre.Application.Features.Gifts.Commands.DeleteGift;

public class DeleteGiftHandler : IRequestHandler<DeleteGiftCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<DeleteGiftHandler> _logger;

    public DeleteGiftHandler(
        IApplicationDbContext context,
        ILogger<DeleteGiftHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result> Handle(
        DeleteGiftCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var gift = await _context.GiftRegistryItems
                .FirstOrDefaultAsync(g => g.Id == request.GiftId, cancellationToken);

            if (gift == null)
                return Result.Failure("Gift not found");

            _context.GiftRegistryItems.Remove(gift);
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting gift {GiftId}", request.GiftId);
            return Result.Failure("Error deleting gift");
        }
    }
}
