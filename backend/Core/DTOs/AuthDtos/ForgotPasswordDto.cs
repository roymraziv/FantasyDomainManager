using System.ComponentModel.DataAnnotations;

namespace FantasyDomainManager.DTOs;

public class ForgotPasswordDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

