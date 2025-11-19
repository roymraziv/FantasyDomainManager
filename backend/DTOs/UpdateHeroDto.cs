namespace FantasyDomainManager.DTOs;

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
