using Celebre.Application.Features.Tables.Commands.AssignSeat;
using Celebre.Application.Features.Tables.Commands.AutoAssignSeats;
using Celebre.Application.Features.Tables.Commands.CreateTable;
using Celebre.Application.Features.Tables.Commands.DeleteTable;
using Celebre.Application.Features.Tables.Commands.UnassignSeat;
using Celebre.Application.Features.Tables.Commands.UpdateTable;
using Celebre.Application.Features.Tables.DTOs;
using Celebre.Application.Features.Tables.Queries.GetTablesList;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Celebre.Api.Controllers;

[ApiController]
[Route("api")]
[Produces("application/json")]
public class TablesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<TablesController> _logger;

    public TablesController(IMediator mediator, ILogger<TablesController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all tables for an event
    /// </summary>
    [HttpGet("events/{eventId}/tables")]
    [ProducesResponseType(typeof(PagedTablesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetTables(
        [FromRoute] string eventId,
        [FromQuery] string? zone,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 100)
    {
        var query = new GetTablesListQuery(eventId, zone, page, limit);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(new PagedTablesResponse(
            result.Value!.Items,
            new PaginationDto(
                result.Value.Page,
                result.Value.Limit,
                result.Value.Total,
                result.Value.TotalPages
            )
        ));
    }

    /// <summary>
    /// Create a new table
    /// </summary>
    [HttpPost("tables")]
    [ProducesResponseType(typeof(TableDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTable([FromBody] CreateTableWithEventRequest request)
    {
        var command = new CreateTableCommand(
            request.EventId,
            request.Label,
            request.Capacity,
            request.Zone,
            request.X,
            request.Y,
            request.Rotation,
            request.Shape
        );

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return CreatedAtAction(nameof(GetTables), new { eventId = request.EventId }, result.Value);
    }

    /// <summary>
    /// Update a table
    /// </summary>
    [HttpPatch("tables/{id}")]
    [ProducesResponseType(typeof(TableDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTable(
        [FromRoute] string id,
        [FromBody] UpdateTableRequest request)
    {
        var command = new UpdateTableCommand(
            id,
            request.Label,
            request.Capacity,
            request.Zone,
            request.X,
            request.Y,
            request.Rotation,
            request.Shape
        );

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Delete a table
    /// </summary>
    [HttpDelete("tables/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTable([FromRoute] string id)
    {
        var command = new DeleteTableCommand(id);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return NoContent();
    }

    /// <summary>
    /// Assign a guest to a seat on a table
    /// </summary>
    [HttpPost("tables/{tableId}/assign")]
    [ProducesResponseType(typeof(AssignSeatResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignSeat(
        [FromRoute] string tableId,
        [FromBody] AssignSeatRequest request)
    {
        var command = new AssignSeatCommand(tableId, request.GuestId, request.SeatIndex, request.Locked);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Unassign a seat
    /// </summary>
    [HttpDelete("seats/{seatId}/assignment")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UnassignSeat([FromRoute] string seatId)
    {
        var command = new UnassignSeatCommand(seatId);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return NoContent();
    }

    /// <summary>
    /// Auto-assign all unassigned confirmed guests to available seats
    /// </summary>
    [HttpPost("events/{eventId}/auto-seat")]
    [ProducesResponseType(typeof(AutoSeatResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AutoAssignSeats([FromRoute] string eventId)
    {
        var command = new AutoAssignSeatsCommand(eventId);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }
}

public record CreateTableWithEventRequest(
    string EventId,
    string Label,
    int Capacity,
    string? Zone,
    double X = 0,
    double Y = 0,
    double Rotation = 0,
    string Shape = "round"
);
