using System;

namespace FantasyDomainManager.Models;

public class Hero
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int Level { get; set; }
    public string Class { get; set; } = string.Empty;
    public int Wage { get; set; }
    public string? Notes { get; set; }

    public int DomainId { get; set; }
    public Domain? Domain { get; set; }
}
