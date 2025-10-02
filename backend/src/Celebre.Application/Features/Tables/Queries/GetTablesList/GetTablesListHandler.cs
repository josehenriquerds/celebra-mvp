using Celebre.Application.Common.Interfaces;
using Celebre.Application.Features.Tables.DTOs;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Celebre.Application.Features.Tables.Queries.GetTablesList;

public class GetTablesListHandler : IRequestHandler<GetTablesListQuery, Result<PagedResult<TableDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetTablesListHandler> _logger;

    public GetTablesListHandler(
        IApplicationDbContext context,
        ILogger<GetTablesListHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<PagedResult<TableDto>>> Handle(
        GetTablesListQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var query = _context.Tables
                .Include(t => t.Seats)
                    .ThenInclude(s => s.Assignments)
                    .ThenInclude(a => a.Guest)
                    .ThenInclude(g => g.Contact)
                .Where(t => t.EventId == request.EventId);

            if (!string.IsNullOrEmpty(request.Zone))
            {
                query = query.Where(t => t.Zone == request.Zone);
            }

            var total = await query.CountAsync(cancellationToken);

            var tableEntities = await query
                .OrderBy(t => t.Label)
                .Skip((request.Page - 1) * request.Limit)
                .Take(request.Limit)
                .ToListAsync(cancellationToken);

            var tables = tableEntities.Select(t => new TableDto(
                t.Id,
                t.EventId,
                t.Label,
                t.Capacity,
                t.Zone,
                t.X,
                t.Y,
                t.Rotation,
                t.Shape.ToString(),
                t.Seats.Select(s => new SeatDto(
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
            )).ToList();

            return Result<PagedResult<TableDto>>.Success(
                new PagedResult<TableDto>(tables, total, request.Page, request.Limit));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching tables for event {EventId}", request.EventId);
            return Result<PagedResult<TableDto>>.Failure("Error fetching tables");
        }
    }
}
