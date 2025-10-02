using Celebre.Application.Common.Interfaces;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Celebre.Application.Features.Tables.Commands.UnassignSeat;

public class UnassignSeatHandler : IRequestHandler<UnassignSeatCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<UnassignSeatHandler> _logger;

    public UnassignSeatHandler(
        IApplicationDbContext context,
        ILogger<UnassignSeatHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result> Handle(
        UnassignSeatCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var assignment = await _context.SeatAssignments
                .FirstOrDefaultAsync(a => a.Id == request.SeatAssignmentId, cancellationToken);

            if (assignment == null)
                return Result.Failure("Seat assignment not found");

            if (assignment.Locked)
                return Result.Failure("Cannot unassign locked seat");

            _context.SeatAssignments.Remove(assignment);
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unassigning seat {SeatAssignmentId}", request.SeatAssignmentId);
            return Result.Failure("Error unassigning seat");
        }
    }
}
