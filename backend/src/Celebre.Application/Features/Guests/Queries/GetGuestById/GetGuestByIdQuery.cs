using Celebre.Application.Features.Guests.DTOs;
using Celebre.Shared;
using MediatR;

namespace Celebre.Application.Features.Guests.Queries.GetGuestById;

public record GetGuestByIdQuery(string GuestId) : IRequest<Result<GuestDto>>;
