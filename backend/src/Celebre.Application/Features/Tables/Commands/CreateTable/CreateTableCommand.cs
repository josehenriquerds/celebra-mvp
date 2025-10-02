using Celebre.Application.Features.Tables.DTOs;
using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Tables.Commands.CreateTable;

public record CreateTableCommand(
    string EventId,
    string Label,
    int Capacity,
    string? Zone,
    double X,
    double Y,
    double Rotation,
    string Shape
) : IRequest<Result<TableDto>>;

public record CreateTableRequest(
    string Label,
    int Capacity,
    string? Zone,
    double X = 0,
    double Y = 0,
    double Rotation = 0,
    string Shape = "round"
);
