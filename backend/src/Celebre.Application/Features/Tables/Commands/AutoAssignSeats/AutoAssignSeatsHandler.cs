using Celebre.Application.Common.Interfaces;
using Celebre.Application.Features.Tables.DTOs;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Celebre.Application.Features.Tables.Commands.AutoAssignSeats;

public class AutoAssignSeatsHandler : IRequestHandler<AutoAssignSeatsCommand, Result<AutoSeatResult>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<AutoAssignSeatsHandler> _logger;

    public AutoAssignSeatsHandler(
        IApplicationDbContext context,
        ILogger<AutoAssignSeatsHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<AutoSeatResult>> Handle(
        AutoAssignSeatsCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get all confirmed guests without seat assignments
            var unassignedGuests = await _context.Guests
                .Include(g => g.SeatAssignments)
                .Include(g => g.Contact)
                    .ThenInclude(c => c.Household)
                .Where(g => g.EventId == request.EventId
                    && g.Rsvp == RsvpStatus.sim
                    && !g.SeatAssignments.Any())
                .OrderByDescending(g => g.Contact.IsVip)
                .ThenBy(g => g.Contact.Household != null ? g.Contact.Household.Label : g.Contact.FullName)
                .ToListAsync(cancellationToken);

            // Get all tables with available seats
            var tables = await _context.Tables
                .Include(t => t.Seats)
                    .ThenInclude(s => s.Assignments)
                .Where(t => t.EventId == request.EventId)
                .OrderBy(t => t.Label)
                .ToListAsync(cancellationToken);

            var assigned = 0;
            var failed = 0;
            var failedGuestIds = new List<string>();
            var newAssignments = new List<SeatAssignment>();

            foreach (var guest in unassignedGuests)
            {
                bool wasAssigned = false;

                foreach (var table in tables)
                {
                    var availableSeat = table.Seats.FirstOrDefault(s => !s.Assignments.Any() && !newAssignments.Any(a => a.SeatId == s.Id));

                    if (availableSeat != null)
                    {
                        newAssignments.Add(new SeatAssignment
                        {
                            Id = CuidGenerator.Generate(),
                            GuestId = guest.Id,
                            SeatId = availableSeat.Id,
                            Locked = false
                        });

                        assigned++;
                        wasAssigned = true;
                        break;
                    }
                }

                if (!wasAssigned)
                {
                    failed++;
                    failedGuestIds.Add(guest.Id);
                }
            }

            if (newAssignments.Any())
            {
                await _context.SeatAssignments.AddRangeAsync(newAssignments, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken);
            }

            return Result<AutoSeatResult>.Success(new AutoSeatResult(
                assigned,
                failed,
                failedGuestIds
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error auto-assigning seats for event {EventId}", request.EventId);
            return Result<AutoSeatResult>.Failure("Error auto-assigning seats");
        }
    }
}
