namespace Celebre.Application.Features.Gifts.DTOs;

public record GiftDto(
    string Id,
    string EventId,
    string Title,
    string? Link,
    decimal? Price,
    string Status,
    string? BuyerContactId,
    string? BuyerName
);

public record PagedGiftsResponse(
    List<GiftDto> Gifts,
    PaginationDto Pagination
);

public record PaginationDto(
    int Page,
    int Limit,
    int Total,
    int TotalPages
);
