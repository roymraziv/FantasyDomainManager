using FantasyDomainManager.DbContexts;
using FantasyDomainManager.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FantasyDomainManager.Services;

public class PasswordResetService : IPasswordResetService
{
    private readonly DomainDb _context;
    private readonly UserManager<User> _userManager;
    private readonly ITokenGenerationService _tokenService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PasswordResetService> _logger;
    private readonly int _tokenExpiryMinutes;
    private readonly string _baseUrl;

    public PasswordResetService(
        DomainDb context,
        UserManager<User> userManager,
        ITokenGenerationService tokenService,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<PasswordResetService> logger)
    {
        _context = context;
        _userManager = userManager;
        _tokenService = tokenService;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
        _tokenExpiryMinutes = int.Parse(_configuration["Email:ResetTokenExpiryMinutes"] ?? "60");
        _baseUrl = _configuration["Email:BaseUrl"] ?? "https://fantasydomainmanager.com";
    }

    public async Task<bool> RequestPasswordResetAsync(string email, string? ipAddress)
    {
        var user = await _userManager.FindByEmailAsync(email);

        if (user == null)
        {
            _logger.LogWarning("Password reset requested for non-existent email: {Email}", email);
            // Return true to prevent email enumeration
            return true;
        }

        // Invalidate any existing tokens for this user
        var existingTokens = await _context.PasswordResetTokens
            .Where(t => t.UserId == user.Id && !t.IsUsed)
            .ToListAsync();

        foreach (var token in existingTokens)
        {
            token.IsUsed = true;
            token.UsedAt = DateTime.UtcNow;
        }

        // Generate new token
        var newToken = new PasswordResetToken
        {
            UserId = user.Id,
            Token = _tokenService.GenerateUrlSafeToken(),
            ExpiresAt = DateTime.UtcNow.AddMinutes(_tokenExpiryMinutes),
            CreatedAt = DateTime.UtcNow,
            IpAddress = ipAddress
        };

        _context.PasswordResetTokens.Add(newToken);

        // Track reset request
        user.PasswordResetRequestedAt = DateTime.UtcNow;
        user.PasswordResetAttempts++;

        await _userManager.UpdateAsync(user);
        await _context.SaveChangesAsync();

        // Send email
        var resetLink = $"{_baseUrl}/reset-password?token={newToken.Token}";
        var emailSent = await _emailService.SendPasswordResetEmailAsync(
            user.Email!,
            user.FirstName,
            resetLink);

        if (!emailSent)
        {
            _logger.LogError("Failed to send password reset email to {Email}", email);
            return false;
        }

        _logger.LogInformation("Password reset token generated for user {UserId}", user.Id);

        return true;
    }

    public async Task<bool> ValidateResetTokenAsync(string token)
    {
        var resetToken = await _context.PasswordResetTokens
            .FirstOrDefaultAsync(t => t.Token == token);

        return resetToken != null && resetToken.IsValid;
    }

    public async Task<bool> ResetPasswordAsync(string token, string newPassword)
    {
        var resetToken = await _context.PasswordResetTokens
            .FirstOrDefaultAsync(t => t.Token == token);

        if (resetToken == null)
        {
            _logger.LogWarning("Password reset token not found: {Token}", token);
            return false;
        }

        if (!resetToken.IsValid)
        {
            _logger.LogWarning(
                "Invalid password reset token for user {UserId}: IsUsed={IsUsed}, IsExpired={IsExpired}",
                resetToken.UserId,
                resetToken.IsUsed,
                resetToken.IsExpired);
            return false;
        }

        // Get user using UserManager
        var user = await _userManager.FindByIdAsync(resetToken.UserId);
        if (user == null)
        {
            _logger.LogWarning("User not found for password reset token: {Token}", token);
            return false;
        }

        // Mark token as used
        resetToken.IsUsed = true;
        resetToken.UsedAt = DateTime.UtcNow;

        // Update password using RemovePasswordAsync + AddPasswordAsync
        // (since we don't have the current password and are using custom tokens)
        var removeResult = await _userManager.RemovePasswordAsync(user);
        
        if (!removeResult.Succeeded)
        {
            _logger.LogError(
                "Failed to remove password for user {UserId}: {Errors}",
                user.Id,
                string.Join(", ", removeResult.Errors.Select(e => e.Description)));
            return false;
        }

        var addResult = await _userManager.AddPasswordAsync(user, newPassword);
        
        if (!addResult.Succeeded)
        {
            _logger.LogError(
                "Failed to set new password for user {UserId}: {Errors}",
                user.Id,
                string.Join(", ", addResult.Errors.Select(e => e.Description)));
            return false;
        }

        // Invalidate all refresh tokens (force re-login on all devices)
        user.RefreshToken = null;
        user.RefreshTokenExpiry = null;

        // Reset password reset tracking
        user.PasswordResetAttempts = 0;
        user.PasswordResetRequestedAt = null;

        await _userManager.UpdateAsync(user);
        await _context.SaveChangesAsync();

        // Send confirmation email
        await _emailService.SendPasswordChangedNotificationAsync(user.Email!, user.FirstName);

        _logger.LogInformation("Password reset successfully for user {UserId}", user.Id);

        return true;
    }
}

