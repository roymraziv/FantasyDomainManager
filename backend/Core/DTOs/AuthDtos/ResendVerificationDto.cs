using System.ComponentModel.DataAnnotations;

namespace FantasyDomainManager.Core.DTOs;

public class ResendVerificationDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

