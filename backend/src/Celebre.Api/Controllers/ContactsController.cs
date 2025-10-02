using Celebre.Application.Common.Interfaces;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;
using Celebre.Shared;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Celebre.Api.Controllers;

[ApiController]
[Route("api")]
[Produces("application/json")]
public class ContactsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public ContactsController(IApplicationDbContext context) => _context = context;

    /// <summary>
    /// Get all contacts for an event (via guests)
    /// </summary>
    [HttpGet("events/{eventId}/contacts")]
    public async Task<IActionResult> GetContacts([FromRoute] string eventId, [FromQuery] int page = 1, [FromQuery] int limit = 50)
    {
        var query = _context.Contacts
            .Where(c => c.Guests.Any(g => g.EventId == eventId));

        var total = await query.CountAsync();

        var contacts = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(c => new
            {
                c.Id,
                c.FullName,
                c.Phone,
                c.Email,
                Relation = c.Relation.ToString(),
                c.IsVip,
                c.HouseholdId
            })
            .ToListAsync();

        return Ok(new
        {
            contacts,
            pagination = new { page, limit, total, totalPages = (int)Math.Ceiling(total / (double)limit) }
        });
    }

    /// <summary>
    /// Create a new contact
    /// </summary>
    [HttpPost("contacts")]
    public async Task<IActionResult> CreateContact([FromBody] CreateContactRequest request)
    {
        var contact = new Contact
        {
            Id = CuidGenerator.Generate(),
            FullName = request.FullName,
            Phone = request.Phone ?? string.Empty,
            Email = request.Email,
            Relation = Enum.Parse<ContactRelation>(request.Relation ?? "outro"),
            IsVip = request.IsVip,
            HouseholdId = request.HouseholdId,
            RestrictionsJson = request.RestrictionsJson,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _context.Contacts.AddAsync(contact);
        await _context.SaveChangesAsync(default);

        return CreatedAtAction(nameof(GetContacts), new { eventId = request.EventId }, contact);
    }

    /// <summary>
    /// Update a contact
    /// </summary>
    [HttpPatch("contacts/{id}")]
    public async Task<IActionResult> UpdateContact([FromRoute] string id, [FromBody] UpdateContactRequest request)
    {
        var contact = await _context.Contacts.FindAsync(id);
        if (contact == null) return NotFound();

        if (!string.IsNullOrEmpty(request.FullName))
            contact.FullName = request.FullName;
        if (!string.IsNullOrEmpty(request.Phone))
            contact.Phone = request.Phone;
        if (request.Email != null)
            contact.Email = request.Email;
        if (request.IsVip.HasValue)
            contact.IsVip = request.IsVip.Value;

        contact.UpdatedAt = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync(default);

        return Ok(contact);
    }

    /// <summary>
    /// Delete a contact
    /// </summary>
    [HttpDelete("contacts/{id}")]
    public async Task<IActionResult> DeleteContact([FromRoute] string id)
    {
        var contact = await _context.Contacts.FindAsync(id);
        if (contact == null) return NotFound();

        _context.Contacts.Remove(contact);
        await _context.SaveChangesAsync(default);

        return NoContent();
    }

    /// <summary>
    /// Create a household
    /// </summary>
    [HttpPost("households")]
    public async Task<IActionResult> CreateHousehold([FromBody] CreateHouseholdRequest request)
    {
        var household = new Household
        {
            Id = CuidGenerator.Generate(),
            Label = request.Label,
            SizeCached = request.SizeCached,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _context.Households.AddAsync(household);
        await _context.SaveChangesAsync(default);

        return CreatedAtAction(nameof(GetContacts), new { eventId = request.EventId }, household);
    }

    /// <summary>
    /// Update a household
    /// </summary>
    [HttpPatch("households/{id}")]
    public async Task<IActionResult> UpdateHousehold([FromRoute] string id, [FromBody] UpdateHouseholdRequest request)
    {
        var household = await _context.Households.FindAsync(id);
        if (household == null) return NotFound();

        if (!string.IsNullOrEmpty(request.Label))
            household.Label = request.Label;
        if (request.SizeCached.HasValue)
            household.SizeCached = request.SizeCached.Value;

        household.UpdatedAt = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync(default);

        return Ok(household);
    }
}

public record CreateContactRequest(string EventId, string FullName, string? Phone, string? Email, string? Relation, bool IsVip, string? HouseholdId, string? RestrictionsJson);
public record UpdateContactRequest(string? FullName, string? Phone, string? Email, bool? IsVip);
public record CreateHouseholdRequest(string EventId, string Label, int SizeCached);
public record UpdateHouseholdRequest(string? Label, int? SizeCached);
