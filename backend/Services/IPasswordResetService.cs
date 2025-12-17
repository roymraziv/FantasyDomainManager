namespace FantasyDomainManager.Services;

public interface IPasswordResetService
{
    Task<bool> RequestPasswordResetAsync(string email, string? ipAddress);
    Task<bool> ResetPasswordAsync(string token, string newPassword);
    Task<bool> ValidateResetTokenAsync(string token);
}

