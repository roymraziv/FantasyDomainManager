namespace FantasyDomainManager.Services;

public interface IEmailVerificationService
{
    Task<string> GenerateVerificationTokenAsync(string userId);
    Task<bool> VerifyEmailAsync(string token);
    Task<bool> ResendVerificationEmailAsync(string email);
}

