using Celebre.Application.Features.Checkins.Commands.CreateCheckin;
using Celebre.Application.Features.Checkins.Commands.UpdateCheckin;
using Celebre.Application.Features.Checkins.DTOs;
using Celebre.Application.Features.Checkins.Queries.GetCheckinsList;
using Celebre.Application.Features.Checkins.Queries.GetCheckinStats;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Celebre.Api.Controllers;

[ApiController]
[Route("api")]
[Produces("application/json")]
public class CheckinsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<CheckinsController> _logger;

    public CheckinsController(IMediator mediator, ILogger<CheckinsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all checkins for an event
    /// </summary>
    /// <param name="eventId">Event ID</param>
    /// <param name="atGate">Filter by at gate checkins</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="limit">Items per page (default: 50)</param>
    [HttpGet("events/{eventId}/checkins")]
    [ProducesResponseType(typeof(PagedCheckinsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetCheckins(
        [FromRoute] string eventId,
        [FromQuery] bool? atGate,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 50)
    {
        var query = new GetCheckinsListQuery(eventId, atGate, page, limit);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(new PagedCheckinsResponse(
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
    /// Get checkin statistics for an event
    /// </summary>
    /// <param name="eventId">Event ID</param>
    [HttpGet("checkins/stats/{eventId}")]
    [ProducesResponseType(typeof(CheckinStatsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetCheckinStats([FromRoute] string eventId)
    {
        var query = new GetCheckinStatsQuery(eventId);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new checkin
    /// </summary>
    /// <param name="request">Checkin data</param>
    [HttpPost("checkins")]
    [ProducesResponseType(typeof(CheckinDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public Task<IActionResult> CreateCheckin([FromBody] CreateCheckinRequest request)
    {
        // EventId should be extracted from the request context or passed explicitly
        // For now, we'll require it in the request body
        return Task.FromResult<IActionResult>(BadRequest(new { error = "EventId is required. Use POST /events/{eventId}/checkins instead" }));
    }

    /// <summary>
    /// Create a new checkin for an event
    /// </summary>
    /// <param name="eventId">Event ID</param>
    /// <param name="request">Checkin data</param>
    [HttpPost("events/{eventId}/checkins")]
    [ProducesResponseType(typeof(CheckinDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCheckinForEvent(
        [FromRoute] string eventId,
        [FromBody] CreateCheckinRequest request)
    {
        var command = new CreateCheckinCommand(eventId, request.GuestId, request.AtGate);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return CreatedAtAction(nameof(GetCheckins), new { eventId }, result.Value);
    }

    /// <summary>
    /// Update a checkin
    /// </summary>
    /// <param name="id">Checkin ID</param>
    /// <param name="request">Update data</param>
    [HttpPatch("checkins/{id}")]
    [ProducesResponseType(typeof(CheckinDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCheckin(
        [FromRoute] string id,
        [FromBody] UpdateCheckinRequest request)
    {
        var command = new UpdateCheckinCommand(id, request.AtGate);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return Ok(result.Value);
    }
}
