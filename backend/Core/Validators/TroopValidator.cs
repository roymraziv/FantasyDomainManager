using System;
using FantasyDomainManager.Models;
using FluentValidation;

namespace FantasyDomainManager.Validators;

public class TroopValidator : AbstractValidator<Troop>
{
    public TroopValidator()
    {
        RuleFor(troop => troop.Type)
            .NotEmpty().WithMessage("Type is required.")
            .MaximumLength(100).WithMessage("Type must not exceed 100 characters.");

        RuleFor(troop => troop.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than 0.");

        RuleFor(troop => troop.Wage)
            .GreaterThanOrEqualTo(0).WithMessage("Wage must be a positive value.");

        RuleFor(troop => troop.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters.");
    }
}
