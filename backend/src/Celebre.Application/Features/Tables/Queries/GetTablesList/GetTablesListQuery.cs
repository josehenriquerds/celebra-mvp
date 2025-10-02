using Celebre.Application.Features.Tables.DTOs;
using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Tables.Queries.GetTablesList;

public record GetTablesListQuery(
    string EventId,
    string? Zone,
    int Page = 1,
    int Limit = 100
) : IRequest<Result<PagedResult<TableDto>>>;
