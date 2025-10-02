using FluentValidation;

namespace Celebre.Application.Features.Checkins.Commands.CreateCheckin;

public class CreateCheckinValidator : AbstractValidator<CreateCheckinCommand>
{
    public CreateCheckinValidator()
    {
        RuleFor(x => x.EventId)
            .NotEmpty().WithMessage("EventId é obrigatório");

        RuleFor(x => x.GuestId)
            .NotEmpty().WithMessage("GuestId é obrigatório");
    }
}
