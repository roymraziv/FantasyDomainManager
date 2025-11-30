using FantasyDomainManager.DTOs;
using FantasyDomainManager.Interfaces;
using FantasyDomainManager.Models;

namespace FantasyDomainManager.Extensions;

public static class UserExtensions
{
    public static async Task<UserDto> ToDto(this User user, ITokenService tokenService)
    {
        var token = await tokenService.CreateToken(user);
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email!,
            Name = $"{user.FirstName} {user.LastName}",
            Token = token,
            TokenExpiry = DateTime.UtcNow.AddMinutes(30)
        };
    }
}
