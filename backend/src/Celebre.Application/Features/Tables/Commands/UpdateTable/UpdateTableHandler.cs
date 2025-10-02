using Celebre.Application.Common.Interfaces;
using Celebre.Application.Features.Tables.DTOs;
using Celebre.Domain.Enums;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Celebre.Application.Features.Tables.Commands.UpdateTable;

public class UpdateTableHandler : IRequestHandler<UpdateTableCommand, Result<TableDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<UpdateTableHandler> _logger;

    public UpdateTableHandler(
        IApplicationDbContext context,
        ILogger<UpdateTableHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<TableDto>> Handle(
        UpdateTableCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var table = await _context.Tables
                .Include(t => t.Seats)
                    .ThenInclude(s => s.Assignments)
                    .ThenInclude(a => a.Guest)
                    .ThenInclude(g => g.Contact)
                .FirstOrDefaultAsync(t => t.Id == request.TableId, cancellationToken);

            if (table == null)
                return Result<TableDto>.Failure("Table not found");

            if (!string.IsNullOrEmpty(request.Label))
                table.Label = request.Label;

            if (request.Capacity.HasValue && request.Capacity.Value != table.Capacity)
            {
                // Update capacity - add or remove seats
                var currentSeats = table.Seats.Count;
                if (request.Capacity.Value > currentSeats)
                {
                    // Add seats
                    for (int i = currentSeats; i < request.Capacity.Value; i++)
                    {
                        var seat = new Domain.Entities.Seat
                        {
                            Id = CuidGenerator.Generate(),
                            TableId = table.Id,
                            Index = i,
                            X = 0,
                            Y = 0,
                            Rotation = 0
                        };
                        table.Seats.Add(seat);
                    }
                }
                else if (request.Capacity.Value < currentSeats)
                {
                    // Remove seats (only unassigned ones)
                    var seatsToRemove = table.Seats
                        .Where(s => s.Index >= request.Capacity.Value && !s.Assignments.Any())
                        .ToList();

                    foreach (var seat in seatsToRemove)
                    {
                        table.Seats.Remove(seat);
                        _context.Seats.Remove(seat);
                    }
                }
                table.Capacity = request.Capacity.Value;
            }

            if (!string.IsNullOrEmpty(request.Zone))
                table.Zone = request.Zone;

            if (request.X.HasValue)
                table.X = request.X.Value;

            if (request.Y.HasValue)
                table.Y = request.Y.Value;

            if (request.Rotation.HasValue)
                table.Rotation = request.Rotation.Value;

            if (!string.IsNullOrEmpty(request.Shape))
                table.Shape = Enum.Parse<TableShape>(request.Shape);

            table.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            var dto = new TableDto(
                table.Id,
                table.EventId,
                table.Label,
                table.Capacity,
                table.Zone,
                table.X,
                table.Y,
                table.Rotation,
                table.Shape.ToString(),
                table.Seats.Select(s => new SeatDto(
                    s.Id,
                    s.TableId,
                    s.Index,
                    s.X,
                    s.Y,
                    s.Rotation,
                    s.Assignments.FirstOrDefault() != null
                        ? new SeatAssignmentDto(
                            s.Assignments.First().Id,
                            s.Assignments.First().GuestId,
                            s.Assignments.First().SeatId,
                            s.Assignments.First().Locked,
                            s.Assignments.First().Guest.Contact.FullName)
                        : null
                )).OrderBy(s => s.Index).ToList()
            );

            return Result<TableDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating table {TableId}", request.TableId);
            return Result<TableDto>.Failure("Error updating table");
        }
    }
}
