using System;

namespace FantasyDomainManager.Core.DTOs;

public class LoginDto
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}
