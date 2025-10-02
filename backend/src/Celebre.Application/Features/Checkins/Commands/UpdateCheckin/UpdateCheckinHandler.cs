using Celebre.Application.Common.Interfaces;
using Celebre.Application.Features.Checkins.DTOs;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Celebre.Application.Features.Checkins.Commands.UpdateCheckin;

public class UpdateCheckinHandler : IRequestHandler<UpdateCheckinCommand, Result<CheckinDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<UpdateCheckinHandler> _logger;

    public UpdateCheckinHandler(
        IApplicationDbContext context,
        ILogger<UpdateCheckinHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<CheckinDto>> Handle(
        UpdateCheckinCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var checkin = await _context.Checkins
                .Include(c => c.Guest)
                    .ThenInclude(g => g.Contact)
                .FirstOrDefaultAsync(c => c.Id == request.CheckinId, cancellationToken);

            if (checkin == null)
                return Result<CheckinDto>.Failure("Checkin not found");

            if (request.AtGate.HasValue)
                checkin.AtGate = request.AtGate.Value;

            await _context.SaveChangesAsync(cancellationToken);

            var dto = new CheckinDto(
                checkin.Id,
                checkin.EventId,
                checkin.GuestId,
                checkin.AtGate,
                checkin.Timestamp,
                checkin.Guest != null
                    ? new CheckinGuestDto(
                        checkin.Guest.Id,
                        checkin.Guest.Contact.FullName,
                        checkin.Guest.Contact.Phone)
                    : null
            );

            return Result<CheckinDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating checkin {CheckinId}", request.CheckinId);
            return Result<CheckinDto>.Failure("Error updating checkin");
        }
    }
}
