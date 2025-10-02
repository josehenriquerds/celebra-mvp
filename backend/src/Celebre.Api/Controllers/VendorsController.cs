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
public class VendorsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public VendorsController(IApplicationDbContext context) => _context = context;

    /// <summary>
    /// Get all public vendors (marketplace - uses VendorPartners)
    /// </summary>
    [HttpGet("vendors")]
    public async Task<IActionResult> GetVendors([FromQuery] string? category, [FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var query = _context.VendorPartners.Where(v => v.Status == VendorPartnerStatus.approved);

        if (!string.IsNullOrEmpty(category))
            query = query.Where(v => v.Categories.Contains(category));

        var total = await query.CountAsync();

        var vendors = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(v => new
            {
                v.Id,
                v.CompanyName,
                v.Categories,
                v.Email,
                v.PhoneE164,
                v.City,
                v.State,
                v.ProfileScore
            })
            .ToListAsync();

        return Ok(new
        {
            vendors,
            pagination = new { page, limit, total, totalPages = (int)Math.Ceiling(total / (double)limit) }
        });
    }

    /// <summary>
    /// Get vendor by ID (VendorPartner)
    /// </summary>
    [HttpGet("vendors/{id}")]
    public async Task<IActionResult> GetVendor([FromRoute] string id)
    {
        var vendor = await _context.VendorPartners.FindAsync(id);
        if (vendor == null) return NotFound();

        return Ok(vendor);
    }

    /// <summary>
    /// Submit a new vendor (VendorPartner)
    /// </summary>
    [HttpPost("vendors")]
    public async Task<IActionResult> CreateVendor([FromBody] CreateVendorRequest request)
    {
        var vendor = new VendorPartner
        {
            Id = CuidGenerator.Generate(),
            Slug = request.Name.ToLower().Replace(" ", "-"),
            CompanyName = request.Name,
            ContactName = request.Name,
            Email = request.Email ?? "",
            PhoneE164 = request.Phone ?? "",
            City = request.City ?? "",
            State = request.State ?? "",
            Country = "BR",
            Categories = new List<string> { request.Category },
            DescriptionShort = request.Description,
            DescriptionLong = request.Description,
            WebsiteUrl = request.Website,
            InstagramHandle = request.Instagram,
            Status = VendorPartnerStatus.pending_review,
            ProfileScore = 0,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _context.VendorPartners.AddAsync(vendor);
        await _context.SaveChangesAsync(default);

        return CreatedAtAction(nameof(GetVendor), new { id = vendor.Id }, vendor);
    }

    /// <summary>
    /// Get vendor partners for an event (stub - uses public vendors for now)
    /// </summary>
    [HttpGet("events/{eventId}/vendor-partners")]
    public async Task<IActionResult> GetVendorPartners([FromRoute] string eventId)
    {
        // Note: In full implementation, would link Vendors to Events via a join table
        var partners = await _context.VendorPartners
            .Where(vp => vp.Status == VendorPartnerStatus.approved)
            .Select(vp => new
            {
                vp.Id,
                vp.CompanyName,
                vp.Categories,
                vp.Email,
                vp.PhoneE164,
                vp.City,
                vp.State,
                Status = vp.Status.ToString(),
                vp.CreatedAt
            })
            .Take(10)
            .ToListAsync();

        return Ok(new { vendorPartners = partners });
    }

    /// <summary>
    /// Add vendor to event (stub)
    /// </summary>
    [HttpPost("vendor-partners")]
    public async Task<IActionResult> AddVendorPartner([FromBody] CreateVendorPartnerRequest request)
    {
        // Stub implementation - would create association in full version
        return Ok(new { message = "Vendor partner added", eventId = request.EventId, vendorId = request.VendorId });
    }

    /// <summary>
    /// Update vendor partner status (stub)
    /// </summary>
    [HttpPatch("vendor-partners/{id}")]
    public async Task<IActionResult> UpdateVendorPartner([FromRoute] string id, [FromBody] UpdateVendorPartnerRequest request)
    {
        var partner = await _context.VendorPartners.FindAsync(id);
        if (partner == null) return NotFound();

        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<VendorPartnerStatus>(request.Status, out var status))
            partner.Status = status;

        partner.UpdatedAt = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync(default);

        return Ok(partner);
    }
}

public record CreateVendorRequest(string Name, string Category, string? Phone, string? Email, string? City, string? State, string? Website, string? Instagram, string? Description);
public record CreateVendorPartnerRequest(string EventId, string VendorId);
public record UpdateVendorPartnerRequest(string? Status);
