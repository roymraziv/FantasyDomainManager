using System;

namespace FantasyDomainManager.Models;

public class Troop
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int Wage { get; set; }
    public string? Notes { get; set; }

    public int DomainId { get; set; }
    public Domain? Domain { get; set; }
}
