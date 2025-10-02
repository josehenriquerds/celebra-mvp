namespace Celebre.Shared;

/// <summary>
/// Represents a paginated collection of items
/// </summary>
public class PagedResult<T>
{
    public List<T> Items { get; set; }
    public int Total { get; set; }
    public int Page { get; set; }
    public int Limit { get; set; }
    public int TotalPages => Total > 0 ? (int)Math.Ceiling((double)Total / Limit) : 0;
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;

    public PagedResult(List<T> items, int total, int page, int limit)
    {
        if (page < 1)
            throw new ArgumentException("Page must be greater than 0", nameof(page));

        if (limit < 1)
            throw new ArgumentException("Limit must be greater than 0", nameof(limit));

        Items = items ?? throw new ArgumentNullException(nameof(items));
        Total = total;
        Page = page;
        Limit = limit;
    }

    /// <summary>
    /// Creates an empty paged result
    /// </summary>
    public static PagedResult<T> Empty(int page = 1, int limit = 50) =>
        new(new List<T>(), 0, page, limit);
}

/// <summary>
/// Extension methods for pagination
/// </summary>
public static class PaginationExtensions
{
    public static PagedResult<T> ToPagedResult<T>(
        this IEnumerable<T> items,
        int total,
        int page,
        int limit)
    {
        return new PagedResult<T>(items.ToList(), total, page, limit);
    }
}
