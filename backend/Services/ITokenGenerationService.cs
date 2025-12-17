namespace FantasyDomainManager.Services;

public interface ITokenGenerationService
{
    string GenerateSecureToken();
    string GenerateUrlSafeToken();
}

