using System;

namespace FantasyDomainManager.Core.DTOs.AuthDtos;

public class UserDto
{
    public required string Id { get; set; }
    public required string Email { get; set; }
    public required string Name { get; set; }
    public required string Token { get; set; }
    public DateTime TokenExpiry { get; set; }
}
