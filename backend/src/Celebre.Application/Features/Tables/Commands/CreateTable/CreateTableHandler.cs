using Celebre.Application.Common.Interfaces;
using Celebre.Application.Features.Tables.DTOs;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Celebre.Application.Features.Tables.Commands.CreateTable;

public class CreateTableHandler : IRequestHandler<CreateTableCommand, Result<TableDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<CreateTableHandler> _logger;

    public CreateTableHandler(
        IApplicationDbContext context,
        ILogger<CreateTableHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<TableDto>> Handle(
        CreateTableCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var eventExists = await _context.Events
                .AnyAsync(e => e.Id == request.EventId, cancellationToken);

            if (!eventExists)
                return Result<TableDto>.Failure("Event not found");

            var table = new Table
            {
                Id = CuidGenerator.Generate(),
                EventId = request.EventId,
                Label = request.Label,
                Capacity = request.Capacity,
                Zone = request.Zone,
                X = request.X,
                Y = request.Y,
                Rotation = request.Rotation,
                Shape = Enum.Parse<TableShape>(request.Shape),
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            // Create seats based on capacity
            var seats = new List<Seat>();
            for (int i = 0; i < request.Capacity; i++)
            {
                seats.Add(new Seat
                {
                    Id = CuidGenerator.Generate(),
                    TableId = table.Id,
                    Index = i,
                    X = 0,
                    Y = 0,
                    Rotation = 0
                });
            }

            await _context.Tables.AddAsync(table, cancellationToken);
            await _context.Seats.AddRangeAsync(seats, cancellationToken);
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
                seats.Select(s => new SeatDto(
                    s.Id,
                    s.TableId,
                    s.Index,
                    s.X,
                    s.Y,
                    s.Rotation,
                    null
                )).ToList()
            );

            return Result<TableDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating table for event {EventId}", request.EventId);
            return Result<TableDto>.Failure("Error creating table");
        }
    }
}
