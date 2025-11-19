namespace FantasyDomainManager.DTOs;

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
