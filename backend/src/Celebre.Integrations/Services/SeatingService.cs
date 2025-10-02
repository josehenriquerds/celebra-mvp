using Celebre.Application.Common.Interfaces;
using Celebre.Domain.Entities;
using Celebre.Shared;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Celebre.Integrations.Services;

public interface ISeatingService
{
    Task<Result<List<Seat>>> GenerateSeatsAsync(string tableId, int capacity, double radius = 80, CancellationToken cancellationToken = default);
    Task<Result<SeatAssignment>> AssignGuestToSeatAsync(string guestId, string seatId, bool locked = false, CancellationToken cancellationToken = default);
    Task<Result> UnassignSeatAsync(string seatId, CancellationToken cancellationToken = default);
}

public class SeatingService : ISeatingService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<SeatingService> _logger;

    public SeatingService(
        IApplicationDbContext context,
        ILogger<SeatingService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<List<Seat>>> GenerateSeatsAsync(string tableId, int capacity, double radius = 80, CancellationToken cancellationToken = default)
    {
        try
        {
            var table = await _context.Tables
                .Include(t => t.Seats)
                .FirstOrDefaultAsync(t => t.Id == tableId, cancellationToken);

            if (table == null)
            {
                _logger.LogWarning("Table not found: {TableId}", tableId);
                return Result<List<Seat>>.Failure("Table not found");
            }

            // Remove existing seats
            if (table.Seats.Any())
            {
                _context.Seats.RemoveRange(table.Seats);
            }

            // Generate new seats in a circle
            var seats = new List<Seat>();
            var angleStep = 360.0 / capacity;

            for (int i = 0; i < capacity; i++)
            {
                var angle = i * angleStep;
                var angleRadians = angle * Math.PI / 180.0;

                var x = Math.Cos(angleRadians) * radius;
                var y = Math.Sin(angleRadians) * radius;

                var seat = new Seat
                {
                    Id = CuidGenerator.Generate(),
                    TableId = tableId,
                    Index = i,
                    X = Math.Round(x, 2),
                    Y = Math.Round(y, 2),
                    Rotation = angle + 90 // Rotate 90 degrees so seats face the center
                };

                _context.Seats.Add(seat);
                seats.Add(seat);
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Generated {Count} seats for Table {TableId} with radius {Radius}",
                capacity, tableId, radius);

            return Result<List<Seat>>.Success(seats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating seats for Table {TableId}", tableId);
            return Result<List<Seat>>.Failure("Failed to generate seats");
        }
    }

    public async Task<Result<SeatAssignment>> AssignGuestToSeatAsync(string guestId, string seatId, bool locked = false, CancellationToken cancellationToken = default)
    {
        try
        {
            var guest = await _context.Guests.FindAsync(new object[] { guestId }, cancellationToken);
            if (guest == null)
            {
                _logger.LogWarning("Guest not found: {GuestId}", guestId);
                return Result<SeatAssignment>.Failure("Guest not found");
            }

            var seat = await _context.Seats
                .Include(s => s.Assignments)
                .FirstOrDefaultAsync(s => s.Id == seatId, cancellationToken);

            if (seat == null)
            {
                _logger.LogWarning("Seat not found: {SeatId}", seatId);
                return Result<SeatAssignment>.Failure("Seat not found");
            }

            // Check if seat is already assigned
            var existingAssignment = seat.Assignments.FirstOrDefault();
            if (existingAssignment != null)
            {
                _logger.LogWarning("Seat {SeatId} is already assigned to Guest {ExistingGuestId}",
                    seatId, existingAssignment.GuestId);
                return Result<SeatAssignment>.Failure("Seat is already assigned");
            }

            // Remove any existing assignment for this guest
            var guestExistingAssignments = await _context.SeatAssignments
                .Where(sa => sa.GuestId == guestId)
                .ToListAsync(cancellationToken);

            if (guestExistingAssignments.Any())
            {
                _context.SeatAssignments.RemoveRange(guestExistingAssignments);
            }

            // Create new assignment
            var assignment = new SeatAssignment
            {
                Id = CuidGenerator.Generate(),
                GuestId = guestId,
                SeatId = seatId,
                Locked = locked
            };

            _context.SeatAssignments.Add(assignment);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Assigned Guest {GuestId} to Seat {SeatId} (Locked: {Locked})",
                guestId, seatId, locked);

            return Result<SeatAssignment>.Success(assignment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning Guest {GuestId} to Seat {SeatId}", guestId, seatId);
            return Result<SeatAssignment>.Failure("Failed to assign guest to seat");
        }
    }

    public async Task<Result> UnassignSeatAsync(string seatId, CancellationToken cancellationToken = default)
    {
        try
        {
            var assignments = await _context.SeatAssignments
                .Where(sa => sa.SeatId == seatId)
                .ToListAsync(cancellationToken);

            if (!assignments.Any())
            {
                _logger.LogInformation("No assignments found for Seat {SeatId}", seatId);
                return Result.Success();
            }

            _context.SeatAssignments.RemoveRange(assignments);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Unassigned {Count} assignment(s) from Seat {SeatId}",
                assignments.Count, seatId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unassigning Seat {SeatId}", seatId);
            return Result.Failure("Failed to unassign seat");
        }
    }
}
