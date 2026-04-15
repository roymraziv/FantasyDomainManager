using System.ComponentModel.DataAnnotations;

namespace FantasyDomainManager.Core.DTOs.AuthDtos;

public class VerifyEmailDto
{
    [Required]
    [MinLength(20)]
    public string Token { get; set; } = string.Empty;
}

