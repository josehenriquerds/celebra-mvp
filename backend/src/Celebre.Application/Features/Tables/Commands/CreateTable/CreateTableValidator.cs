using FluentValidation;

namespace Celebre.Application.Features.Tables.Commands.CreateTable;

public class CreateTableValidator : AbstractValidator<CreateTableCommand>
{
    public CreateTableValidator()
    {
        RuleFor(x => x.EventId)
            .NotEmpty().WithMessage("EventId é obrigatório");

        RuleFor(x => x.Label)
            .NotEmpty().WithMessage("Label é obrigatório")
            .MaximumLength(50).WithMessage("Label muito longo");

        RuleFor(x => x.Capacity)
            .GreaterThan(0).WithMessage("Capacity deve ser maior que 0");

        RuleFor(x => x.Shape)
            .Must(s => s == "round" || s == "square" || s == "rect")
            .WithMessage("Shape deve ser 'round', 'square' ou 'rect'");
    }
}
