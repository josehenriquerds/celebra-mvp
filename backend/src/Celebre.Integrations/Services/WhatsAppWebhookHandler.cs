using Celebre.Application.Common.Interfaces;
using Celebre.Domain.Entities;
using Celebre.Domain.Enums;
using Celebre.Shared;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Celebre.Integrations.Services;

public interface IWhatsAppWebhookHandler
{
    Task<Result> HandleWebhookAsync(string payload, CancellationToken cancellationToken = default);
}

public class WhatsAppWebhookHandler : IWhatsAppWebhookHandler
{
    private readonly IApplicationDbContext _context;
    private readonly IEngagementService _engagementService;
    private readonly ILogger<WhatsAppWebhookHandler> _logger;

    public WhatsAppWebhookHandler(
        IApplicationDbContext context,
        IEngagementService engagementService,
        ILogger<WhatsAppWebhookHandler> logger)
    {
        _context = context;
        _engagementService = engagementService;
        _logger = logger;
    }

    public async Task<Result> HandleWebhookAsync(string payload, CancellationToken cancellationToken = default)
    {
        try
        {
            var payloadHash = GeneratePayloadHash(payload);

            // Check idempotency
            var existingLog = await _context.EventLogs
                .FirstOrDefaultAsync(e => e.Id == payloadHash, cancellationToken);

            if (existingLog != null)
            {
                _logger.LogInformation("Webhook payload already processed: {PayloadHash}", payloadHash);
                return Result.Success();
            }

            // Parse webhook payload
            var webhookData = JsonSerializer.Deserialize<WhatsAppWebhookPayload>(payload);
            if (webhookData == null)
            {
                _logger.LogWarning("Failed to deserialize webhook payload");
                return Result.Failure("Invalid webhook payload");
            }

            // Log the event
            var eventLog = new EventLog
            {
                Id = payloadHash,
                EventId = null,
                Source = "whatsapp_webhook",
                Type = "message_received",
                PayloadJson = payload,
                CreatedAt = DateTimeOffset.UtcNow
            };
            _context.EventLogs.Add(eventLog);

            // Process the webhook
            await ProcessWebhookDataAsync(webhookData, cancellationToken);

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Webhook processed successfully: {PayloadHash}", payloadHash);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling WhatsApp webhook");
            return Result.Failure("Failed to handle webhook");
        }
    }

    private async System.Threading.Tasks.Task ProcessWebhookDataAsync(WhatsAppWebhookPayload webhookData, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(webhookData.PhoneNumber) || string.IsNullOrEmpty(webhookData.Message))
        {
            _logger.LogWarning("Webhook data missing required fields");
            return;
        }

        // Find contact by phone number
        var contact = await _context.Contacts
            .FirstOrDefaultAsync(c => c.Phone == webhookData.PhoneNumber, cancellationToken);

        if (contact == null)
        {
            _logger.LogWarning("Contact not found for phone number: {PhoneNumber}", webhookData.PhoneNumber);
            return;
        }

        // Find active guest for this contact
        var guest = await _context.Guests
            .Include(g => g.Event)
            .Where(g => g.ContactId == contact.Id && !g.OptOut)
            .OrderByDescending(g => g.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (guest == null)
        {
            _logger.LogWarning("No active guest found for contact: {ContactId}", contact.Id);
            return;
        }

        var message = webhookData.Message.Trim().ToUpperInvariant();
        var eventId = guest.EventId;
        var contactId = contact.Id;

        // Create interaction
        var interaction = new Interaction
        {
            Id = CuidGenerator.Generate(),
            EventId = eventId,
            ContactId = contactId,
            Channel = Channel.whatsapp,
            Kind = InteractionKind.mensagem,
            PayloadJson = JsonSerializer.Serialize(webhookData),
            OccurredAt = DateTimeOffset.UtcNow
        };
        _context.Interactions.Add(interaction);

        // Process commands
        if (message.Contains("SIM") || message.Contains("CONFIRMO"))
        {
            await ProcessRsvpConfirmationAsync(guest, eventId, contactId, cancellationToken);
        }
        else if (message.Contains("NAO") || message.Contains("NÃO") || message.Contains("CANCELAR"))
        {
            await ProcessRsvpDeclineAsync(guest, eventId, contactId, cancellationToken);
        }
        else if (message.Contains("SAIR") || message.Contains("PARAR") || message.Contains("OPT-OUT"))
        {
            await ProcessOptOutAsync(guest, eventId, contactId, cancellationToken);
        }
        else
        {
            // General message - increment engagement
            await _engagementService.IncrementScoreAsync(contactId, eventId, 1, cancellationToken);

            // Create timeline entry
            var timelineEntry = new TimelineEntry
            {
                Id = CuidGenerator.Generate(),
                EventId = eventId,
                ActorType = ActorType.guest,
                Type = TimelineType.msg,
                RefId = interaction.Id,
                OccurredAt = DateTimeOffset.UtcNow,
                MetaJson = JsonSerializer.Serialize(new { message = webhookData.Message })
            };
            _context.TimelineEntries.Add(timelineEntry);
        }
    }

    private async System.Threading.Tasks.Task ProcessRsvpConfirmationAsync(Guest guest, string eventId, string contactId, CancellationToken cancellationToken)
    {
        guest.Rsvp = RsvpStatus.sim;
        guest.UpdatedAt = DateTimeOffset.UtcNow;

        // Increment engagement score for RSVP confirmation
        await _engagementService.IncrementScoreAsync(contactId, eventId, 10, cancellationToken);

        // Create timeline entry
        var timelineEntry = new TimelineEntry
        {
            Id = CuidGenerator.Generate(),
            EventId = eventId,
            ActorType = ActorType.guest,
            Type = TimelineType.rsvp,
            RefId = guest.Id,
            OccurredAt = DateTimeOffset.UtcNow,
            MetaJson = JsonSerializer.Serialize(new { rsvp = "confirmado" })
        };
        _context.TimelineEntries.Add(timelineEntry);

        _logger.LogInformation("RSVP confirmed for Guest {GuestId} in Event {EventId}", guest.Id, eventId);
    }

    private async System.Threading.Tasks.Task ProcessRsvpDeclineAsync(Guest guest, string eventId, string contactId, CancellationToken cancellationToken)
    {
        guest.Rsvp = RsvpStatus.nao;
        guest.UpdatedAt = DateTimeOffset.UtcNow;

        // Decrement engagement score for RSVP decline
        await _engagementService.DecrementScoreAsync(contactId, eventId, 5, cancellationToken);

        // Create timeline entry
        var timelineEntry = new TimelineEntry
        {
            Id = CuidGenerator.Generate(),
            EventId = eventId,
            ActorType = ActorType.guest,
            Type = TimelineType.rsvp,
            RefId = guest.Id,
            OccurredAt = DateTimeOffset.UtcNow,
            MetaJson = JsonSerializer.Serialize(new { rsvp = "recusado" })
        };
        _context.TimelineEntries.Add(timelineEntry);

        _logger.LogInformation("RSVP declined for Guest {GuestId} in Event {EventId}", guest.Id, eventId);
    }

    private async System.Threading.Tasks.Task ProcessOptOutAsync(Guest guest, string eventId, string contactId, CancellationToken cancellationToken)
    {
        guest.OptOut = true;
        guest.UpdatedAt = DateTimeOffset.UtcNow;

        // Decrement engagement score for opt-out
        await _engagementService.DecrementScoreAsync(contactId, eventId, 15, cancellationToken);

        // Create timeline entry
        var timelineEntry = new TimelineEntry
        {
            Id = CuidGenerator.Generate(),
            EventId = eventId,
            ActorType = ActorType.guest,
            Type = TimelineType.msg,
            RefId = guest.Id,
            OccurredAt = DateTimeOffset.UtcNow,
            MetaJson = JsonSerializer.Serialize(new { action = "opt_out" })
        };
        _context.TimelineEntries.Add(timelineEntry);

        _logger.LogInformation("Guest {GuestId} opted out in Event {EventId}", guest.Id, eventId);
    }

    private static string GeneratePayloadHash(string payload)
    {
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var hashBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(payload));
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }

    private class WhatsAppWebhookPayload
    {
        public string PhoneNumber { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTimeOffset Timestamp { get; set; }
    }
}
