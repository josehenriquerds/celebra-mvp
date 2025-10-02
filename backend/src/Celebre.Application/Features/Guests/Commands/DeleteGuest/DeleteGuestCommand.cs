using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Guests.Commands.DeleteGuest;

public record DeleteGuestCommand(string GuestId) : IRequest<Result>;
