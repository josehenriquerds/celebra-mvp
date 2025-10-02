using Celebre.Application.Common.Interfaces;
using Celebre.Domain.Entities;
using Celebre.Integrations.Common.Options;
using Celebre.Shared;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Text;

namespace Celebre.Integrations.Services;

public interface IGuestPortalTokenService
{
    string GenerateToken(string guestId);
    Task<Result<Guest>> ValidateTokenAsync(string token, CancellationToken cancellationToken = default);
}

public class GuestPortalTokenService : IGuestPortalTokenService
{
    private readonly IApplicationDbContext _context;
    private readonly GuestPortalOptions _options;
    private readonly ILogger<GuestPortalTokenService> _logger;

    public GuestPortalTokenService(
        IApplicationDbContext context,
        IOptions<GuestPortalOptions> options,
        ILogger<GuestPortalTokenService> logger)
    {
        _context = context;
        _options = options.Value;
        _logger = logger;
    }

    public string GenerateToken(string guestId)
    {
        if (string.IsNullOrEmpty(_options.Secret))
        {
            _logger.LogWarning("GuestPortal secret is not configured");
            throw new InvalidOperationException("GuestPortal secret is not configured");
        }

        var tokenData = $"{guestId}:{_options.Secret}";
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(tokenData));
        var token = Convert.ToHexString(hashBytes).ToLowerInvariant();

        _logger.LogInformation("Generated token for Guest {GuestId}", guestId);
        return token;
    }

    public async Task<Result<Guest>> ValidateTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(token))
            {
                _logger.LogWarning("Token is null or empty");
                return Result<Guest>.Failure("Invalid token");
            }

            if (string.IsNullOrEmpty(_options.Secret))
            {
                _logger.LogWarning("GuestPortal secret is not configured");
                return Result<Guest>.Failure("GuestPortal secret is not configured");
            }

            // Get all guests and find matching token
            var guests = await _context.Guests
                .Include(g => g.Contact)
                .Include(g => g.Event)
                .ToListAsync(cancellationToken);

            foreach (var guest in guests)
            {
                var expectedToken = GenerateToken(guest.Id);
                if (expectedToken == token)
                {
                    _logger.LogInformation("Token validated successfully for Guest {GuestId}", guest.Id);
                    return Result<Guest>.Success(guest);
                }
            }

            _logger.LogWarning("Invalid token provided");
            return Result<Guest>.Failure("Invalid token");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating token");
            return Result<Guest>.Failure("Failed to validate token");
        }
    }
}
