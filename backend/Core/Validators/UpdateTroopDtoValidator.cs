using FantasyDomainManager.DTOs;
using FluentValidation;

namespace FantasyDomainManager.Validators;

public class UpdateTroopDtoValidator : AbstractValidator<UpdateTroopDto>
{
    public UpdateTroopDtoValidator()
    {
        RuleFor(dto => dto.Type)
            .NotEmpty().WithMessage("Type is required.")
            .MaximumLength(100).WithMessage("Type must not exceed 100 characters.");

        RuleFor(dto => dto.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than 0.");

        RuleFor(dto => dto.Wage)
            .GreaterThanOrEqualTo(0).WithMessage("Wage must be a positive value.");

        RuleFor(dto => dto.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters.");
    }
}
