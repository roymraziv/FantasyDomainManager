using FantasyDomainManager.DTOs;
using FluentValidation;

namespace FantasyDomainManager.Validators;

public class UpdateHeroDtoValidator : AbstractValidator<UpdateHeroDto>
{
    public UpdateHeroDtoValidator()
    {
        RuleFor(dto => dto.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(dto => dto.Role)
            .NotEmpty().WithMessage("Role is required.")
            .MaximumLength(100).WithMessage("Role must not exceed 100 characters.");

        RuleFor(dto => dto.Level)
            .GreaterThan(0).WithMessage("Level must be greater than 0.");

        RuleFor(dto => dto.Wage)
            .GreaterThanOrEqualTo(0).WithMessage("Wage must be a positive value.");

        RuleFor(dto => dto.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters.");
    }
}
