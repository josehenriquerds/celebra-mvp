using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Tables.Commands.DeleteTable;

public record DeleteTableCommand(string TableId) : IRequest<Result>;
