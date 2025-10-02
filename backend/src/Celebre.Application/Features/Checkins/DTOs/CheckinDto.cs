namespace Celebre.Application.Features.Checkins.DTOs;

public record CheckinDto(
    string Id,
    string EventId,
    string GuestId,
    bool AtGate,
    DateTimeOffset Timestamp,
    CheckinGuestDto? Guest
);

public record CheckinGuestDto(
    string Id,
    string FullName,
    string? Phone
);

public record PagedCheckinsResponse(
    List<CheckinDto> Checkins,
    PaginationDto Pagination
);

public record PaginationDto(
    int Page,
    int Limit,
    int Total,
    int TotalPages
);

public record CheckinStatsDto(
    int Total,
    int AtGate,
    int Manual,
    int TotalGuests,
    int CheckedInGuests,
    double CheckinRate
);
