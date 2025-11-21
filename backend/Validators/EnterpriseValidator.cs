using System;
using System.Data;
using FantasyDomainManager.Models;
using FluentValidation;

namespace FantasyDomainManager.Validators;

public class EnterpriseValidator : AbstractValidator<Enterprise>
{
    public EnterpriseValidator()
    {
        RuleFor(enterprise => enterprise.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        // Income validation - mutually exclusive with income limits
        RuleFor(enterprise => enterprise.Income)
            .Must((enterprise, income) =>
                income == null ||
                (enterprise.IncomeLowerLimit == null && enterprise.IncomeUpperLimit == null))
            .WithMessage("Income must be null when income lower limit and upper limit are provided.")
            .When(enterprise => enterprise.Income != null)
            .GreaterThanOrEqualTo(0).WithMessage("Income must be a positive value.");

        // Income lower limit validation
        RuleFor(enterprise => enterprise.IncomeLowerLimit)
            .Must((enterprise, lowerLimit) =>
                lowerLimit == null || enterprise.Income == null)
            .WithMessage("Income lower limit must be null when income is provided.")
            .When(enterprise => enterprise.IncomeLowerLimit != null)
            .GreaterThanOrEqualTo(0).WithMessage("Income lower limit must be a positive value.")
            .LessThanOrEqualTo(enterprise => enterprise.IncomeUpperLimit ?? int.MaxValue)
            .WithMessage("Income lower limit must be less than or equal to income upper limit.");

        // Income upper limit validation
        RuleFor(enterprise => enterprise.IncomeUpperLimit)
            .Must((enterprise, upperLimit) =>
                upperLimit == null || enterprise.Income == null)
            .WithMessage("Income upper limit must be null when income is provided.")
            .When(enterprise => enterprise.IncomeUpperLimit != null)
            .GreaterThanOrEqualTo(0).WithMessage("Income upper limit must be a positive value.");

        // Upkeep cost validation - mutually exclusive with upkeep cost limits
        RuleFor(enterprise => enterprise.UpkeepCost)
            .Must((enterprise, upkeepCost) =>
                upkeepCost == null ||
                (enterprise.UpkeepCostLowerLimit == null && enterprise.UpkeepCostUpperLimit == null))
            .When(enterprise => enterprise.UpkeepCost != null)
            .WithMessage("Upkeep cost must be null when upkeep cost lower limit and upper limit are provided.")
            .GreaterThanOrEqualTo(0).WithMessage("Upkeep cost must be a positive value.");

        RuleFor(enterprise => enterprise.UpkeepCostLowerLimit)
            .Must((enterprise, upkeepLowerLimit) =>
                upkeepLowerLimit == null || enterprise.UpkeepCost == null)
            .WithMessage("Upkeep cost lower limit must be null when upkeep cost is provided.")
            .When(enterprise => enterprise.UpkeepCostLowerLimit != null)
            .GreaterThanOrEqualTo(0).WithMessage("Upkeep cost lower limit must be a positive value.")
            .LessThanOrEqualTo(enterprise => enterprise.UpkeepCostUpperLimit ?? int.MaxValue)
            .WithMessage("Upkeep cost lower limit must be less than or equal to upkeep cost upper limit.");

        RuleFor(enterprise => enterprise.UpkeepCostUpperLimit)
            .Must((enterprise, upkeepUpperLimit) =>
                upkeepUpperLimit == null || enterprise.UpkeepCost == null)
            .WithMessage("Upkeep cost upper limit must be null when upkeep cost is provided.")
            .When(enterprise => enterprise.UpkeepCostUpperLimit != null)
            .GreaterThanOrEqualTo(0).WithMessage("Upkeep cost upper limit must be a positive value.");

        RuleFor(enterprise => enterprise.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters.");
    }
}
