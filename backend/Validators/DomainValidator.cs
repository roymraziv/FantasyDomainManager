using System;
using System.Data;
using FantasyDomainManager.Models;
using FluentValidation;

namespace FantasyDomainManager.Validators;

public class DomainValidator : AbstractValidator<Domain>
{
    public DomainValidator()
    {
        RuleFor(domain => domain.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(domain => domain.Ruler)
            .NotEmpty().WithMessage("Ruler is required.")
            .MaximumLength(100).WithMessage("Ruler must not exceed 100 characters.");

        RuleFor(domain => domain.Population)
            .GreaterThan(0).WithMessage("Population must be greater than 0.");

        RuleFor(domain => domain.UpkeepCost)
            .Must((domain, upkeepCost) => 
                upkeepCost == null || 
                (domain.UpkeepCostLowerLimit == null && domain.UpkeepCostUpperLimit == null))
            .When(domain => domain.UpkeepCost != null)
            .WithMessage("Upkeep cost must be null when upkeep cost lower limit and upper limit are provided.")
            .GreaterThanOrEqualTo(0).WithMessage("Upkeep cost must be a positive value.");

        RuleFor(domain => domain.UpkeepCostLowerLimit)
            .Must((domain, upkeepLowerLimit) =>
                upkeepLowerLimit == null || domain.UpkeepCost == null)
            .WithMessage("Upkeep cost lower limit must be null when upkeep cost is provided.")
            .When(domain => domain.UpkeepCostLowerLimit != null)
            .GreaterThanOrEqualTo(0).WithMessage("Upkeep cost lower limit must be a positive value.")
            .LessThanOrEqualTo(domain => domain.UpkeepCostUpperLimit ?? int.MaxValue)
            .WithMessage("Upkeep cost lower limit must be less than or equal to upkeep cost upper limit.");

        RuleFor(domain => domain.UpkeepCostUpperLimit)
            .Must((domain, upkeepUpperLimit) =>
                upkeepUpperLimit == null || domain.UpkeepCost == null)
            .WithMessage("Upkeep cost upper limit must be null when upkeep cost is provided.")
            .When(domain => domain.UpkeepCostUpperLimit != null)
            .GreaterThanOrEqualTo(0).WithMessage("Upkeep cost upper limit must be a positive value.");

        // Income validation - mutually exclusive with income limits
        RuleFor(domain => domain.Income)
            .Must((domain, income) => 
                income == null || 
                (domain.IncomeLowerLimit == null && domain.IncomeUpperLimit == null))
            .WithMessage("Income must be null when income lower limit and upper limit are provided.")
            .When(domain => domain.Income != null)
            .GreaterThanOrEqualTo(0).WithMessage("Income must be a positive value.");

        // Income lower limit validation
        RuleFor(domain => domain.IncomeLowerLimit)
            .Must((domain, lowerLimit) => 
                lowerLimit == null || domain.Income == null)
            .WithMessage("Income lower limit must be null when income is provided.")
            .When(domain => domain.IncomeLowerLimit != null)
            .GreaterThanOrEqualTo(0).WithMessage("Income lower limit must be a positive value.")
            .LessThanOrEqualTo(domain => domain.IncomeUpperLimit ?? int.MaxValue)
            .WithMessage("Income lower limit must be less than or equal to income upper limit.");

        // Income upper limit validation
        RuleFor(domain => domain.IncomeUpperLimit)
            .Must((domain, upperLimit) => 
                upperLimit == null || domain.Income == null)
            .WithMessage("Income upper limit must be null when income is provided.")
            .When(domain => domain.IncomeUpperLimit != null)
            .GreaterThanOrEqualTo(0).WithMessage("Income upper limit must be a positive value.");

        // Ensure at least one income option is provided
        RuleFor(domain => domain)
            .Must(domain => 
                domain.Income != null || 
                (domain.IncomeLowerLimit != null && domain.IncomeUpperLimit != null))
            .WithMessage("Either income or both income lower limit and upper limit must be provided.");


        RuleFor(domain => domain.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters.");
    }
}
