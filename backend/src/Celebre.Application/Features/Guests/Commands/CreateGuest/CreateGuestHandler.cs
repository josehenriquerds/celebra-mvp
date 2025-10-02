using Celebre.Application.Common.Interfaces;
using Celebre.Application.Features.Guests.DTOs;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;
using Celebre.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Celebre.Application.Features.Guests.Commands.CreateGuest;

public class CreateGuestHandler : IRequestHandler<CreateGuestCommand, Result<GuestDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<CreateGuestHandler> _logger;

    public CreateGuestHandler(
        IApplicationDbContext context,
        ILogger<CreateGuestHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<GuestDto>> Handle(
        CreateGuestCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Validate event exists
            var eventExists = await _context.Events
                .AnyAsync(e => e.Id == request.EventId, cancellationToken);

            if (!eventExists)
                return Result<GuestDto>.Failure("Event not found");

            // Validate contact exists
            var contact = await _context.Contacts
                .Include(c => c.Household)
                .Include(c => c.EngagementScores.Where(es => es.EventId == request.EventId))
                .FirstOrDefaultAsync(c => c.Id == request.ContactId, cancellationToken);

            if (contact == null)
                return Result<GuestDto>.Failure("Contact not found");

            // Check if guest already exists
            var existingGuest = await _context.Guests
                .AnyAsync(g => g.EventId == request.EventId && g.ContactId == request.ContactId, cancellationToken);

            if (existingGuest)
                return Result<GuestDto>.Failure("Guest already exists for this event");

            // Create guest
            var guest = new Guest
            {
                Id = CuidGenerator.Generate(),
                EventId = request.EventId,
                ContactId = request.ContactId,
                InviteStatus = InviteStatus.nao_enviado,
                Rsvp = RsvpStatus.pendente,
                Seats = request.Seats,
                Children = request.Children,
                TransportNeeded = request.TransportNeeded,
                OptOut = false,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            await _context.Guests.AddAsync(guest, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            // Reload with includes for DTO
            guest.Contact = contact;

            var dto = new GuestDto(
                guest.Id,
                guest.EventId,
                new ContactDto(
                    contact.Id,
                    contact.FullName,
                    contact.Phone,
                    contact.Email,
                    contact.Relation.ToString(),
                    contact.IsVip,
                    contact.RestrictionsJson != null
                        ? JsonSerializer.Deserialize<object>(contact.RestrictionsJson)
                        : null
                ),
                contact.Household != null
                    ? new HouseholdDto(
                        contact.Household.Id,
                        contact.Household.Label,
                        contact.Household.SizeCached)
                    : null,
                guest.InviteStatus.ToString(),
                guest.Rsvp.ToString(),
                guest.Seats,
                guest.Children,
                guest.TransportNeeded,
                guest.OptOut,
                contact.EngagementScores.FirstOrDefault() != null
                    ? new EngagementScoreDto(
                        contact.EngagementScores.First().Value,
                        contact.EngagementScores.First().Tier.ToString())
                    : null,
                null, // No table assignment yet
                new List<TagDto>() // No tags yet
            );

            return Result<GuestDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating guest for event {EventId}", request.EventId);
            return Result<GuestDto>.Failure("Error creating guest");
        }
    }
}
