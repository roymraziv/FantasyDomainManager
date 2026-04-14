using System;
using System.Data;
using FantasyDomainManager.Models;
using FluentValidation;

namespace FantasyDomainManager.Validators;

public class HeroValidator : AbstractValidator<Hero>
{
    public HeroValidator()
    {
        RuleFor(hero => hero.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(hero => hero.Class)
            .NotEmpty().WithMessage("Class is required.")
            .MaximumLength(50).WithMessage("Class must not exceed 50 characters.");

        RuleFor(hero => hero.Level)
            .GreaterThan(0).WithMessage("Level must be greater than 0.");

        RuleFor(hero => hero.Wage)
            .GreaterThanOrEqualTo(0).WithMessage("Wage must be a positive value.");

        RuleFor(hero => hero.Role)
            .NotEmpty().WithMessage("Role is required.")
            .MaximumLength(100).WithMessage("Role must not exceed 100 characters.");
            
        RuleFor(hero => hero.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters.");

    }
}
