namespace FantasyDomainManager.DTOs;

// Domain DTOs
public class UpdateDomainDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Ruler { get; set; } = string.Empty;
    public int Population { get; set; }
    public int? UpkeepCost { get; set; }
    public int? UpkeepCostLowerLimit { get; set; }
    public int? UpkeepCostUpperLimit { get; set; }
    public int? Income { get; set; }
    public int? IncomeLowerLimit { get; set; }
    public int? IncomeUpperLimit { get; set; }
    public string? Notes { get; set; }
}

// Hero DTOs
public class UpdateHeroDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int Level { get; set; }
    public int Wage { get; set; }
    public string? Notes { get; set; }
    public int DomainId { get; set; }
}

// Enterprise DTOs
public class UpdateEnterpriseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? Income { get; set; }
    public int? IncomeLowerLimit { get; set; }
    public int? IncomeUpperLimit { get; set; }
    public int? UpkeepCost { get; set; }
    public int? UpkeepCostLowerLimit { get; set; }
    public int? UpkeepCostUpperLimit { get; set; }
    public string? Notes { get; set; }
    public int DomainId { get; set; }
}

// Troop DTOs
public class UpdateTroopDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int Wage { get; set; }
    public string? Notes { get; set; }
    public int DomainId { get; set; }
}
