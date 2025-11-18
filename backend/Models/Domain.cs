using System;

namespace FantasyDomainManager.Models;

public class Domain
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
    public List<Enterprise> Enterprises { get; set; } = new();
    public List<Hero> Heroes { get; set; } = new();
    public List<Troop> Troops { get; set; } = new();
}
