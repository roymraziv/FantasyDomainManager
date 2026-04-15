using System.ComponentModel.DataAnnotations;

namespace FantasyDomainManager.Core.DTOs.AuthDtos;

public class ResendVerificationDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

