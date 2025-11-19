using FantasyDomainManager.DTOs;
using FluentValidation;

namespace FantasyDomainManager.Validators;

public class UpdateDomainDtoValidator : AbstractValidator<UpdateDomainDto>
{
    public UpdateDomainDtoValidator()
    {
        RuleFor(dto => dto.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(dto => dto.Ruler)
            .NotEmpty().WithMessage("Ruler is required.")
            .MaximumLength(100).WithMessage("Ruler must not exceed 100 characters.");

        RuleFor(dto => dto.Population)
            .GreaterThanOrEqualTo(0).WithMessage("Population must be a positive value.");

        RuleFor(dto => dto.UpkeepCost)
            .Must((dto, upkeepCost) =>
                upkeepCost == null ||
                (dto.UpkeepCostLowerLimit == null && dto.UpkeepCostUpperLimit == null))
            .When(dto => dto.UpkeepCost != null)
            .WithMessage("Upkeep cost must be null when upkeep cost lower limit and upper limit are provided.")
            .GreaterThanOrEqualTo(0).WithMessage("Upkeep cost must be a positive value.");

        RuleFor(dto => dto.UpkeepCostLowerLimit)
            .Must((dto, upkeepLowerLimit) =>
                upkeepLowerLimit == null || dto.UpkeepCost == null)
            .WithMessage("Upkeep cost lower limit must be null when upkeep cost is provided.")
            .When(dto => dto.UpkeepCostLowerLimit != null)
            .GreaterThanOrEqualTo(0).WithMessage("Upkeep cost lower limit must be a positive value.")
            .LessThanOrEqualTo(dto => dto.UpkeepCostUpperLimit ?? int.MaxValue)
            .WithMessage("Upkeep cost lower limit must be less than or equal to upkeep cost upper limit.");

        RuleFor(dto => dto.UpkeepCostUpperLimit)
            .Must((dto, upkeepUpperLimit) =>
                upkeepUpperLimit == null || dto.UpkeepCost == null)
            .WithMessage("Upkeep cost upper limit must be null when upkeep cost is provided.")
            .When(dto => dto.UpkeepCostUpperLimit != null)
            .GreaterThanOrEqualTo(0).WithMessage("Upkeep cost upper limit must be a positive value.");

        RuleFor(dto => dto.Income)
            .Must((dto, income) =>
                income == null ||
                (dto.IncomeLowerLimit == null && dto.IncomeUpperLimit == null))
            .WithMessage("Income must be null when income lower limit and upper limit are provided.")
            .When(dto => dto.Income != null)
            .GreaterThanOrEqualTo(0).WithMessage("Income must be a positive value.");

        RuleFor(dto => dto.IncomeLowerLimit)
            .Must((dto, lowerLimit) =>
                lowerLimit == null || dto.Income == null)
            .WithMessage("Income lower limit must be null when income is provided.")
            .When(dto => dto.IncomeLowerLimit != null)
            .GreaterThanOrEqualTo(0).WithMessage("Income lower limit must be a positive value.")
            .LessThanOrEqualTo(dto => dto.IncomeUpperLimit ?? int.MaxValue)
            .WithMessage("Income lower limit must be less than or equal to income upper limit.");

        RuleFor(dto => dto.IncomeUpperLimit)
            .Must((dto, upperLimit) =>
                upperLimit == null || dto.Income == null)
            .WithMessage("Income upper limit must be null when income is provided.")
            .When(dto => dto.IncomeUpperLimit != null)
            .GreaterThanOrEqualTo(0).WithMessage("Income upper limit must be a positive value.");

        RuleFor(dto => dto.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters.");
    }
}

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

public class UpdateEnterpriseDtoValidator : AbstractValidator<UpdateEnterpriseDto>
{
    public UpdateEnterpriseDtoValidator()
    {
        RuleFor(dto => dto.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(dto => dto.UpkeepCost)
            .Must((dto, upkeepCost) =>
                upkeepCost == null ||
                (dto.UpkeepCostLowerLimit == null && dto.UpkeepCostUpperLimit == null))
            .When(dto => dto.UpkeepCost != null)
            .WithMessage("Upkeep cost must be null when upkeep cost lower limit and upper limit are provided.")
            .GreaterThanOrEqualTo(0).WithMessage("Upkeep cost must be a positive value.");

        RuleFor(dto => dto.UpkeepCostLowerLimit)
            .Must((dto, upkeepLowerLimit) =>
                upkeepLowerLimit == null || dto.UpkeepCost == null)
            .WithMessage("Upkeep cost lower limit must be null when upkeep cost is provided.")
            .When(dto => dto.UpkeepCostLowerLimit != null)
            .GreaterThanOrEqualTo(0).WithMessage("Upkeep cost lower limit must be a positive value.")
            .LessThanOrEqualTo(dto => dto.UpkeepCostUpperLimit ?? int.MaxValue)
            .WithMessage("Upkeep cost lower limit must be less than or equal to upkeep cost upper limit.");

        RuleFor(dto => dto.UpkeepCostUpperLimit)
            .Must((dto, upkeepUpperLimit) =>
                upkeepUpperLimit == null || dto.UpkeepCost == null)
            .WithMessage("Upkeep cost upper limit must be null when upkeep cost is provided.")
            .When(dto => dto.UpkeepCostUpperLimit != null)
            .GreaterThanOrEqualTo(0).WithMessage("Upkeep cost upper limit must be a positive value.");

        RuleFor(dto => dto.Income)
            .Must((dto, income) =>
                income == null ||
                (dto.IncomeLowerLimit == null && dto.IncomeUpperLimit == null))
            .WithMessage("Income must be null when income lower limit and upper limit are provided.")
            .When(dto => dto.Income != null)
            .GreaterThanOrEqualTo(0).WithMessage("Income must be a positive value.");

        RuleFor(dto => dto.IncomeLowerLimit)
            .Must((dto, lowerLimit) =>
                lowerLimit == null || dto.Income == null)
            .WithMessage("Income lower limit must be null when income is provided.")
            .When(dto => dto.IncomeLowerLimit != null)
            .GreaterThanOrEqualTo(0).WithMessage("Income lower limit must be a positive value.")
            .LessThanOrEqualTo(dto => dto.IncomeUpperLimit ?? int.MaxValue)
            .WithMessage("Income lower limit must be less than or equal to income upper limit.");

        RuleFor(dto => dto.IncomeUpperLimit)
            .Must((dto, upperLimit) =>
                upperLimit == null || dto.Income == null)
            .WithMessage("Income upper limit must be null when income is provided.")
            .When(dto => dto.IncomeUpperLimit != null)
            .GreaterThanOrEqualTo(0).WithMessage("Income upper limit must be a positive value.");

        RuleFor(dto => dto.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters.");
    }
}

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
