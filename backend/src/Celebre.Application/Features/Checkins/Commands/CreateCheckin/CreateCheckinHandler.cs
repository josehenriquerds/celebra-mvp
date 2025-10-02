using Celebre.Application.Common.Interfaces;
using Celebre.Application.Features.Checkins.DTOs;
using Celebre.Domain.Entities;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Celebre.Application.Features.Checkins.Commands.CreateCheckin;

public class CreateCheckinHandler : IRequestHandler<CreateCheckinCommand, Result<CheckinDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<CreateCheckinHandler> _logger;

    public CreateCheckinHandler(
        IApplicationDbContext context,
        ILogger<CreateCheckinHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<CheckinDto>> Handle(
        CreateCheckinCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Validate guest exists and belongs to event
            var guest = await _context.Guests
                .Include(g => g.Contact)
                .FirstOrDefaultAsync(g => g.Id == request.GuestId && g.EventId == request.EventId, cancellationToken);

            if (guest == null)
                return Result<CheckinDto>.Failure("Guest not found or does not belong to this event");

            // Check if already checked in
            var existingCheckin = await _context.Checkins
                .FirstOrDefaultAsync(c => c.EventId == request.EventId && c.GuestId == request.GuestId, cancellationToken);

            if (existingCheckin != null)
                return Result<CheckinDto>.Failure("Guest already checked in");

            // Create checkin
            var checkin = new Checkin
            {
                Id = CuidGenerator.Generate(),
                EventId = request.EventId,
                GuestId = request.GuestId,
                AtGate = request.AtGate,
                Timestamp = DateTimeOffset.UtcNow
            };

            await _context.Checkins.AddAsync(checkin, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            var dto = new CheckinDto(
                checkin.Id,
                checkin.EventId,
                checkin.GuestId,
                checkin.AtGate,
                checkin.Timestamp,
                new CheckinGuestDto(
                    guest.Id,
                    guest.Contact.FullName,
                    guest.Contact.Phone
                )
            );

            return Result<CheckinDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating checkin for guest {GuestId}", request.GuestId);
            return Result<CheckinDto>.Failure("Error creating checkin");
        }
    }
}
