using System.ComponentModel.DataAnnotations;

namespace FantasyDomainManager.Core.DTOs;

public class VerifyEmailDto
{
    [Required]
    [MinLength(20)]
    public string Token { get; set; } = string.Empty;
}

