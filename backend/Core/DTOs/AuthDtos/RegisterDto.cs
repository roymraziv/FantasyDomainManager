using System;

namespace FantasyDomainManager.Core.DTOs.AuthDtos;

public class RegisterDto
{
    public required string Email { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Password { get; set; }
}
