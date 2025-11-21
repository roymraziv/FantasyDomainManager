using System;
using FantasyDomainManager.Models;

namespace FantasyDomainManager.Interfaces;

public interface ITokenService
{
    string CreateToken(User user);
}
