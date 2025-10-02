using Celebre.Integrations.Common.Options;
using Celebre.Shared;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net.Http.Json;
using System.Text.Json;

namespace Celebre.Integrations.Services;

public interface IN8nService
{
    Task<Result> SendMessageAsync(string phoneNumber, string message, string eventId, string guestId, CancellationToken cancellationToken = default);
    Task<Result> NotifyGiftReceivedAsync(string giftId, string eventId, CancellationToken cancellationToken = default);
    Task<Result> NotifyVendorSubmittedAsync(string vendorId, CancellationToken cancellationToken = default);
}

public class N8nService : IN8nService
{
    private readonly HttpClient _httpClient;
    private readonly N8nOptions _options;
    private readonly ILogger<N8nService> _logger;

    public N8nService(
        HttpClient httpClient,
        IOptions<N8nOptions> options,
        ILogger<N8nService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;

        if (!string.IsNullOrEmpty(_options.BaseUrl))
        {
            _httpClient.BaseAddress = new Uri(_options.BaseUrl);
        }

        if (!string.IsNullOrEmpty(_options.ApiKey))
        {
            _httpClient.DefaultRequestHeaders.Add("X-N8N-API-KEY", _options.ApiKey);
        }
    }

    public async Task<Result> SendMessageAsync(string phoneNumber, string message, string eventId, string guestId, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(_options.SendMessageWebhook))
            {
                _logger.LogWarning("SendMessageWebhook is not configured");
                return Result.Failure("SendMessageWebhook is not configured");
            }

            var payload = new
            {
                phoneNumber,
                message,
                eventId,
                guestId,
                timestamp = DateTimeOffset.UtcNow
            };

            var response = await _httpClient.PostAsJsonAsync(_options.SendMessageWebhook, payload, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("Failed to send message via N8n. Status: {StatusCode}, Error: {Error}",
                    response.StatusCode, errorContent);
                return Result.Failure(new[] { $"Failed to send message: {response.StatusCode}" });
            }

            _logger.LogInformation("Message sent successfully via N8n to {PhoneNumber} for Event {EventId}",
                phoneNumber, eventId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message via N8n to {PhoneNumber}", phoneNumber);
            return Result.Failure("Failed to send message via N8n");
        }
    }

    public async Task<Result> NotifyGiftReceivedAsync(string giftId, string eventId, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(_options.GiftReceivedWebhook))
            {
                _logger.LogWarning("GiftReceivedWebhook is not configured");
                return Result.Failure("GiftReceivedWebhook is not configured");
            }

            var payload = new
            {
                giftId,
                eventId,
                timestamp = DateTimeOffset.UtcNow
            };

            var response = await _httpClient.PostAsJsonAsync(_options.GiftReceivedWebhook, payload, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("Failed to notify gift received via N8n. Status: {StatusCode}, Error: {Error}",
                    response.StatusCode, errorContent);
                return Result.Failure(new[] { $"Failed to notify gift received: {response.StatusCode}" });
            }

            _logger.LogInformation("Gift received notification sent successfully via N8n for Gift {GiftId} in Event {EventId}",
                giftId, eventId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error notifying gift received via N8n for Gift {GiftId}", giftId);
            return Result.Failure("Failed to notify gift received via N8n");
        }
    }

    public async Task<Result> NotifyVendorSubmittedAsync(string vendorId, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(_options.VendorSubmittedWebhook))
            {
                _logger.LogWarning("VendorSubmittedWebhook is not configured");
                return Result.Failure("VendorSubmittedWebhook is not configured");
            }

            var payload = new
            {
                vendorId,
                timestamp = DateTimeOffset.UtcNow
            };

            var response = await _httpClient.PostAsJsonAsync(_options.VendorSubmittedWebhook, payload, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("Failed to notify vendor submitted via N8n. Status: {StatusCode}, Error: {Error}",
                    response.StatusCode, errorContent);
                return Result.Failure(new[] { $"Failed to notify vendor submitted: {response.StatusCode}" });
            }

            _logger.LogInformation("Vendor submitted notification sent successfully via N8n for Vendor {VendorId}",
                vendorId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error notifying vendor submitted via N8n for Vendor {VendorId}", vendorId);
            return Result.Failure("Failed to notify vendor submitted via N8n");
        }
    }
}
