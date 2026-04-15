using System;

namespace FantasyDomainManager.Core.DTOs.AuthDtos;

public class LoginDto
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}
