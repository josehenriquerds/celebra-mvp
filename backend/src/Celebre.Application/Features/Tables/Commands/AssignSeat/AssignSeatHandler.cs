using Celebre.Application.Common.Interfaces;
using Celebre.Application.Features.Tables.DTOs;
using Celebre.Domain.Entities;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Celebre.Application.Features.Tables.Commands.AssignSeat;

public class AssignSeatHandler : IRequestHandler<AssignSeatCommand, Result<AssignSeatResult>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<AssignSeatHandler> _logger;

    public AssignSeatHandler(
        IApplicationDbContext context,
        ILogger<AssignSeatHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<AssignSeatResult>> Handle(
        AssignSeatCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var table = await _context.Tables
                .Include(t => t.Seats)
                    .ThenInclude(s => s.Assignments)
                .FirstOrDefaultAsync(t => t.Id == request.TableId, cancellationToken);

            if (table == null)
                return Result<AssignSeatResult>.Failure("Table not found");

            var guest = await _context.Guests
                .Include(g => g.Contact)
                .Include(g => g.SeatAssignments)
                .FirstOrDefaultAsync(g => g.Id == request.GuestId, cancellationToken);

            if (guest == null)
                return Result<AssignSeatResult>.Failure("Guest not found");

            // Remove existing assignments for this guest
            if (guest.SeatAssignments.Any())
            {
                _context.SeatAssignments.RemoveRange(guest.SeatAssignments);
            }

            // Find available seat
            Seat? targetSeat = null;
            if (request.SeatIndex.HasValue)
            {
                targetSeat = table.Seats.FirstOrDefault(s => s.Index == request.SeatIndex.Value);
                if (targetSeat == null)
                    return Result<AssignSeatResult>.Failure("Seat index not found");

                if (targetSeat.Assignments.Any())
                    return Result<AssignSeatResult>.Failure("Seat is already occupied");
            }
            else
            {
                targetSeat = table.Seats.FirstOrDefault(s => !s.Assignments.Any());
                if (targetSeat == null)
                    return Result<AssignSeatResult>.Failure("No available seats on this table");
            }

            // Create assignment
            var assignment = new SeatAssignment
            {
                Id = CuidGenerator.Generate(),
                GuestId = request.GuestId,
                SeatId = targetSeat.Id,
                Locked = request.Locked
            };

            await _context.SeatAssignments.AddAsync(assignment, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            var result = new AssignSeatResult(
                "Seat assigned successfully",
                new SeatAssignmentDto(
                    assignment.Id,
                    assignment.GuestId,
                    assignment.SeatId,
                    assignment.Locked,
                    guest.Contact.FullName
                )
            );

            return Result<AssignSeatResult>.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning seat for guest {GuestId}", request.GuestId);
            return Result<AssignSeatResult>.Failure("Error assigning seat");
        }
    }
}
