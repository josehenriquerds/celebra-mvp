using Celebre.Application.Common.Interfaces;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Celebre.Application.Features.Guests.Commands.DeleteGuest;

public class DeleteGuestHandler : IRequestHandler<DeleteGuestCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<DeleteGuestHandler> _logger;

    public DeleteGuestHandler(
        IApplicationDbContext context,
        ILogger<DeleteGuestHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result> Handle(
        DeleteGuestCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var guest = await _context.Guests
                .FirstOrDefaultAsync(g => g.Id == request.GuestId, cancellationToken);

            if (guest == null)
                return Result.Failure("Guest not found");

            _context.Guests.Remove(guest);
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting guest {GuestId}", request.GuestId);
            return Result.Failure("Error deleting guest");
        }
    }
}
