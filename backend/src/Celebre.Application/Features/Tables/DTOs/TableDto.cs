namespace Celebre.Application.Features.Tables.DTOs;

public record TableDto(
    string Id,
    string EventId,
    string Label,
    int Capacity,
    string? Zone,
    double X,
    double Y,
    double Rotation,
    string Shape,
    List<SeatDto> Seats
);

public record SeatDto(
    string Id,
    string TableId,
    int Index,
    double X,
    double Y,
    double Rotation,
    SeatAssignmentDto? Assignment
);

public record SeatAssignmentDto(
    string Id,
    string GuestId,
    string SeatId,
    bool Locked,
    string GuestName
);

public record PagedTablesResponse(
    List<TableDto> Tables,
    PaginationDto Pagination
);

public record PaginationDto(
    int Page,
    int Limit,
    int Total,
    int TotalPages
);

public record AssignSeatResult(
    string Message,
    SeatAssignmentDto Assignment
);

public record AutoSeatResult(
    int Assigned,
    int Failed,
    List<string> UnassignedGuestIds
);
