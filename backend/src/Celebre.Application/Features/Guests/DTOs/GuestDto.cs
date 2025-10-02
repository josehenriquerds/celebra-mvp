namespace Celebre.Application.Features.Guests.DTOs;

public record GuestDto(
    string Id,
    string EventId,
    ContactDto Contact,
    HouseholdDto? Household,
    string InviteStatus,
    string Rsvp,
    int Seats,
    int Children,
    bool TransportNeeded,
    bool OptOut,
    EngagementScoreDto? EngagementScore,
    TableInfoDto? Table,
    List<TagDto> Tags
);

public record ContactDto(
    string Id,
    string FullName,
    string Phone,
    string? Email,
    string Relation,
    bool IsVip,
    object? Restrictions
);

public record HouseholdDto(
    string Id,
    string Label,
    int Size
);

public record EngagementScoreDto(
    int Value,
    string Tier
);

public record TableInfoDto(
    string Id,
    string Label
);

public record TagDto(
    string Id,
    string Name
);

public record PagedGuestsResponse(
    List<GuestDto> Guests,
    PaginationDto Pagination
);

public record PaginationDto(
    int Page,
    int Limit,
    int Total,
    int TotalPages
);
