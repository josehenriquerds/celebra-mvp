using Celebre.Application.Features.Gifts.Commands.CreateGift;
using Celebre.Application.Features.Gifts.Commands.DeleteGift;
using Celebre.Application.Features.Gifts.Commands.UpdateGift;
using Celebre.Application.Features.Gifts.DTOs;
using Celebre.Application.Features.Gifts.Queries.GetGiftsList;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Celebre.Api.Controllers;

[ApiController]
[Route("api")]
[Produces("application/json")]
public class GiftsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<GiftsController> _logger;

    public GiftsController(IMediator mediator, ILogger<GiftsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all gifts for an event
    /// </summary>
    [HttpGet("events/{eventId}/gifts")]
    [ProducesResponseType(typeof(PagedGiftsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetGifts(
        [FromRoute] string eventId,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 50)
    {
        var query = new GetGiftsListQuery(eventId, status, page, limit);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(new PagedGiftsResponse(
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
    /// Create a new gift
    /// </summary>
    [HttpPost("gifts")]
    [ProducesResponseType(typeof(GiftDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateGift([FromBody] CreateGiftRequest request)
    {
        var command = new CreateGiftCommand(
            request.EventId,
            request.Title,
            request.Link,
            request.Price
        );

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return CreatedAtAction(nameof(GetGifts), new { eventId = request.EventId }, result.Value);
    }

    /// <summary>
    /// Update a gift status
    /// </summary>
    [HttpPatch("gifts/{id}")]
    [ProducesResponseType(typeof(GiftDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateGift(
        [FromRoute] string id,
        [FromBody] UpdateGiftRequest request)
    {
        var command = new UpdateGiftCommand(id, request.Status, request.BuyerContactId);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Delete a gift
    /// </summary>
    [HttpDelete("gifts/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteGift([FromRoute] string id)
    {
        var command = new DeleteGiftCommand(id);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return NoContent();
    }
}
