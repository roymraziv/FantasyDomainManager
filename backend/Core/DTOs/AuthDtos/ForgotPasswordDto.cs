using System.ComponentModel.DataAnnotations;

namespace FantasyDomainManager.Core.DTOs.AuthDtos;

public class ForgotPasswordDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

