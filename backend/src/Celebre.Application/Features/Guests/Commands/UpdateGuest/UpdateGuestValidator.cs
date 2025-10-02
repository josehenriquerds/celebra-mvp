using FluentValidation;

namespace Celebre.Application.Features.Guests.Commands.UpdateGuest;

public class UpdateGuestValidator : AbstractValidator<UpdateGuestCommand>
{
    public UpdateGuestValidator()
    {
        RuleFor(x => x.GuestId)
            .NotEmpty().WithMessage("GuestId é obrigatório");

        When(x => !string.IsNullOrEmpty(x.Rsvp), () =>
        {
            RuleFor(x => x.Rsvp)
                .Must(r => r == "sim" || r == "não" || r == "pendente")
                .WithMessage("RSVP deve ser 'sim', 'não' ou 'pendente'");
        });

        When(x => x.Seats.HasValue, () =>
        {
            RuleFor(x => x.Seats!.Value)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Seats deve ser maior ou igual a 0");
        });

        When(x => x.Children.HasValue, () =>
        {
            RuleFor(x => x.Children!.Value)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Children deve ser maior ou igual a 0");
        });
    }
}
