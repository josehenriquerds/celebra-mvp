using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Guests.Commands.BulkInviteGuests;

public record BulkInviteGuestsCommand(
    List<string> GuestIds,
    string? MessageTemplateId
) : IRequest<Result<BulkInviteResult>>;

public record BulkInviteGuestsRequest(
    List<string> GuestIds,
    string? MessageTemplateId
);

public record BulkInviteResult(
    int Sent,
    int Failed,
    List<string> FailedIds
);
