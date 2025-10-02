using Celebre.Application.Features.Guests.DTOs;
using Celebre.Application.Features.Guests.Queries.GetGuestsList;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Celebre.Api.Controllers;

[ApiController]
[Route("api/events/{eventId}/guests")]
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
    [HttpGet]
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
}
