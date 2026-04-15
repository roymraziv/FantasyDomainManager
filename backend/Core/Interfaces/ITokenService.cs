using FantasyDomainManager.Core.Models;

namespace FantasyDomainManager.Core.Interfaces;

public interface ITokenService
{
    Task<string> CreateToken(User user);

    string GenerateRefreshToken();
}
