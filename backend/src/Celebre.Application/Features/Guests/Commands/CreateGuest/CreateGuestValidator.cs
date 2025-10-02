using FluentValidation;

namespace Celebre.Application.Features.Guests.Commands.CreateGuest;

public class CreateGuestValidator : AbstractValidator<CreateGuestCommand>
{
    public CreateGuestValidator()
    {
        RuleFor(x => x.EventId)
            .NotEmpty().WithMessage("EventId é obrigatório");

        RuleFor(x => x.ContactId)
            .NotEmpty().WithMessage("ContactId é obrigatório");

        RuleFor(x => x.Seats)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Seats deve ser maior ou igual a 0");

        RuleFor(x => x.Children)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Children deve ser maior ou igual a 0");
    }
}
