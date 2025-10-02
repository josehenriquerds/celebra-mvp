using System.Security.Cryptography;
using System.Text;

namespace Celebre.Shared;

/// <summary>
/// Generates CUID (Collision-resistant Unique Identifier) strings
/// Compatible with Prisma's default ID generation
/// </summary>
public static class CuidGenerator
{
    private static long _counter = 0;
    private static readonly object _lockObject = new();
    private const string Base36Chars = "0123456789abcdefghijklmnopqrstuvwxyz";

    /// <summary>
    /// Generates a new CUID string (25 characters)
    /// Format: c{timestamp}{counter}{random}
    /// </summary>
    public static string Generate()
    {
        lock (_lockObject)
        {
            // Timestamp: milliseconds since epoch
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            // Counter: incremental, wraps at 1679616 (36^4)
            var counter = Interlocked.Increment(ref _counter) % 1679616;

            // Random: secure random number
            var random = RandomNumberGenerator.GetInt32(0, int.MaxValue);

            // Concatenate parts
            var cuid = $"c{ToBase36(timestamp)}{ToBase36(counter).PadLeft(4, '0')}{ToBase36(random)}";

            // Trim to 25 characters to match Prisma
            return cuid.Length > 25 ? cuid[..25] : cuid.PadRight(25, '0');
        }
    }

    /// <summary>
    /// Converts a number to base36 string
    /// </summary>
    private static string ToBase36(long value)
    {
        if (value == 0) return "0";

        var result = new StringBuilder();
        var absValue = Math.Abs(value);

        while (absValue > 0)
        {
            result.Insert(0, Base36Chars[(int)(absValue % 36)]);
            absValue /= 36;
        }

        return result.ToString();
    }

    /// <summary>
    /// Validates if a string is a valid CUID format
    /// </summary>
    public static bool IsValid(string? cuid)
    {
        if (string.IsNullOrEmpty(cuid))
            return false;

        // Must start with 'c' and be 25 characters
        if (!cuid.StartsWith('c') || cuid.Length != 25)
            return false;

        // All characters must be alphanumeric (base36)
        return cuid.All(c => Base36Chars.Contains(c));
    }

    /// <summary>
    /// Generates multiple CUIDs at once
    /// </summary>
    public static List<string> GenerateBatch(int count)
    {
        if (count < 1)
            throw new ArgumentException("Count must be greater than 0", nameof(count));

        var cuids = new List<string>(count);
        for (int i = 0; i < count; i++)
        {
            cuids.Add(Generate());
        }
        return cuids;
    }
}
