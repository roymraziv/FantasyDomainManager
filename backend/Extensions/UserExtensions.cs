using System;
using FantasyDomainManager.DTOs;
using FantasyDomainManager.DTOs.CreateDtos;
using FantasyDomainManager.Interfaces;
using FantasyDomainManager.Models;

namespace FantasyDomainManager.Extensions;

public static class UserExtensions
{
    public static UserDto ToDto(this User user, ITokenService tokenService)
    {
        var token = tokenService.CreateToken(user);
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = $"{user.FirstName} {user.LastName}",
            Token = token
        };
    }
}
