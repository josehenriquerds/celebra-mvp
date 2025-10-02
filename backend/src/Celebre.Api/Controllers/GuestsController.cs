using Celebre.Application.Features.Guests.Commands.BulkInviteGuests;
using Celebre.Application.Features.Guests.Commands.CreateGuest;
using Celebre.Application.Features.Guests.Commands.DeleteGuest;
using Celebre.Application.Features.Guests.Commands.UpdateGuest;
using Celebre.Application.Features.Guests.DTOs;
using Celebre.Application.Features.Guests.Queries.GetGuestById;
using Celebre.Application.Features.Guests.Queries.GetGuestsList;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Celebre.Api.Controllers;

[ApiController]
[Route("api")]
[Produces("application/json")]
public class GuestsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<GuestsController> _logger;

    public GuestsController(IMediator mediator, ILogger<GuestsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all guests for an event with pagination and filters
    /// </summary>
    /// <param name="eventId">Event ID</param>
    /// <param name="filter">Filter: vip, children, pending, confirmed, no_phone</param>
    /// <param name="search">Search in name, phone, email</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="limit">Items per page (default: 50)</param>
    [HttpGet("events/{eventId}/guests")]
    [ProducesResponseType(typeof(PagedGuestsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetGuests(
        [FromRoute] string eventId,
        [FromQuery] string? filter,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 50)
    {
        var query = new GetGuestsListQuery(eventId, filter, search, page, limit);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(new PagedGuestsResponse(
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
    /// Get a specific guest by ID
    /// </summary>
    /// <param name="id">Guest ID</param>
    [HttpGet("guests/{id}", Name = "GetGuestById")]
    [ProducesResponseType(typeof(GuestDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetGuestById([FromRoute] string id)
    {
        var query = new GetGuestByIdQuery(id);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new guest for an event
    /// </summary>
    /// <param name="eventId">Event ID</param>
    /// <param name="request">Guest creation data</param>
    [HttpPost("events/{eventId}/guests")]
    [ProducesResponseType(typeof(GuestDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateGuest(
        [FromRoute] string eventId,
        [FromBody] CreateGuestRequest request)
    {
        var command = new CreateGuestCommand(
            eventId,
            request.ContactId,
            request.Seats,
            request.Children,
            request.TransportNeeded
        );

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return CreatedAtRoute("GetGuestById", new { id = result.Value!.Id }, result.Value);
    }

    /// <summary>
    /// Update guest information (RSVP, seats, etc.)
    /// </summary>
    /// <param name="id">Guest ID</param>
    /// <param name="request">Update data</param>
    [HttpPatch("guests/{id}")]
    [ProducesResponseType(typeof(GuestDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateGuest(
        [FromRoute] string id,
        [FromBody] UpdateGuestRequest request)
    {
        var command = new UpdateGuestCommand(
            id,
            request.Rsvp,
            request.Seats,
            request.Children,
            request.TransportNeeded,
            request.OptOut
        );

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Delete a guest
    /// </summary>
    /// <param name="id">Guest ID</param>
    [HttpDelete("guests/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteGuest([FromRoute] string id)
    {
        var command = new DeleteGuestCommand(id);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return NoContent();
    }

    /// <summary>
    /// Send bulk invites to multiple guests
    /// </summary>
    /// <param name="request">Bulk invite data</param>
    [HttpPost("guests/bulk-invite")]
    [ProducesResponseType(typeof(BulkInviteResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BulkInvite([FromBody] BulkInviteGuestsRequest request)
    {
        var command = new BulkInviteGuestsCommand(request.GuestIds, request.MessageTemplateId);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }
}
