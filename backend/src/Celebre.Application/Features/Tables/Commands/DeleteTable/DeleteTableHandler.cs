using Celebre.Application.Common.Interfaces;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Celebre.Application.Features.Tables.Commands.DeleteTable;

public class DeleteTableHandler : IRequestHandler<DeleteTableCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<DeleteTableHandler> _logger;

    public DeleteTableHandler(
        IApplicationDbContext context,
        ILogger<DeleteTableHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result> Handle(
        DeleteTableCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var table = await _context.Tables
                .Include(t => t.Seats)
                    .ThenInclude(s => s.Assignments)
                .FirstOrDefaultAsync(t => t.Id == request.TableId, cancellationToken);

            if (table == null)
                return Result.Failure("Table not found");

            // Check if any seats are assigned
            if (table.Seats.Any(s => s.Assignments.Any()))
            {
                return Result.Failure("Cannot delete table with assigned seats");
            }

            _context.Tables.Remove(table);
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting table {TableId}", request.TableId);
            return Result.Failure("Error deleting table");
        }
    }
}
