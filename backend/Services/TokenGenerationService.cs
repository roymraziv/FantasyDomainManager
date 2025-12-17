using System.Security.Cryptography;

namespace FantasyDomainManager.Services;

public class TokenGenerationService : ITokenGenerationService
{
    private const int TokenByteSize = 32; // 256 bits

    public string GenerateSecureToken()
    {
        var randomBytes = new byte[TokenByteSize];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }
        return Convert.ToBase64String(randomBytes);
    }

    public string GenerateUrlSafeToken()
    {
        var token = GenerateSecureToken();
        // Make URL-safe by replacing characters
        return token.Replace('+', '-').Replace('/', '_').TrimEnd('=');
    }
}

