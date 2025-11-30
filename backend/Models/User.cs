using System;
using Microsoft.AspNetCore.Identity;

namespace FantasyDomainManager.Models;

public class User : IdentityUser
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }

    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
}
