namespace FantasyDomainManager.DTOs;

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
