using System;

namespace FantasyDomainManager.DTOs;

public class UserDto
{
    public required string Id { get; set; }
    public required string Email { get; set; }
    public required string Name { get; set; }
    public required string Token { get; set; }
}
