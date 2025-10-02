using Celebre.Application.Features.Tables.DTOs;
using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Tables.Commands.UpdateTable;

public record UpdateTableCommand(
    string TableId,
    string? Label,
    int? Capacity,
    string? Zone,
    double? X,
    double? Y,
    double? Rotation,
    string? Shape
) : IRequest<Result<TableDto>>;

public record UpdateTableRequest(
    string? Label,
    int? Capacity,
    string? Zone,
    double? X,
    double? Y,
    double? Rotation,
    string? Shape
);
