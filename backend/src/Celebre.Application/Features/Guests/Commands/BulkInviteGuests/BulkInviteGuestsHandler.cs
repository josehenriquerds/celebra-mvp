using Celebre.Application.Common.Interfaces;
using Celebre.Domain.Enums;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Celebre.Application.Features.Guests.Commands.BulkInviteGuests;

public class BulkInviteGuestsHandler : IRequestHandler<BulkInviteGuestsCommand, Result<BulkInviteResult>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<BulkInviteGuestsHandler> _logger;

    public BulkInviteGuestsHandler(
        IApplicationDbContext context,
        ILogger<BulkInviteGuestsHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<BulkInviteResult>> Handle(
        BulkInviteGuestsCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var guests = await _context.Guests
                .Include(g => g.Contact)
                .Where(g => request.GuestIds.Contains(g.Id))
                .ToListAsync(cancellationToken);

            var sent = 0;
            var failed = 0;
            var failedIds = new List<string>();

            foreach (var guest in guests)
            {
                try
                {
                    // Check if guest has valid contact info
                    if (string.IsNullOrEmpty(guest.Contact.Phone))
                    {
                        failed++;
                        failedIds.Add(guest.Id);
                        continue;
                    }

                    // Update invite status
                    guest.InviteStatus = InviteStatus.enviado;
                    guest.UpdatedAt = DateTimeOffset.UtcNow;

                    // TODO: Integration with messaging service would go here
                    // For now, just mark as sent

                    sent++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error sending invite to guest {GuestId}", guest.Id);
                    failed++;
                    failedIds.Add(guest.Id);
                }
            }

            await _context.SaveChangesAsync(cancellationToken);

            return Result<BulkInviteResult>.Success(new BulkInviteResult(sent, failed, failedIds));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending bulk invites");
            return Result<BulkInviteResult>.Failure("Error sending bulk invites");
        }
    }
}
