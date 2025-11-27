using System;
using FantasyDomainManager.Models;

namespace FantasyDomainManager.Interfaces;

public interface ITokenService
{
    Task<string> CreateToken(User user);

    string GenerateRefreshToken();
}
