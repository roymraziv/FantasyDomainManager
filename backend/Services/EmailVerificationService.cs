using FantasyDomainManager.DbContexts;
using FantasyDomainManager.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FantasyDomainManager.Services;

public class EmailVerificationService : IEmailVerificationService
{
    private readonly DomainDb _context;
    private readonly UserManager<User> _userManager;
    private readonly ITokenGenerationService _tokenService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailVerificationService> _logger;
    private readonly int _tokenExpiryMinutes;
    private readonly string _baseUrl;

    public EmailVerificationService(
        DomainDb context,
        UserManager<User> userManager,
        ITokenGenerationService tokenService,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<EmailVerificationService> logger)
    {
        _context = context;
        _userManager = userManager;
        _tokenService = tokenService;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
        _tokenExpiryMinutes = int.Parse(_configuration["Email:VerificationTokenExpiryMinutes"] ?? "1440");
        _baseUrl = _configuration["Email:BaseUrl"] ?? "https://fantasydomainmanager.com";
    }

    public async Task<string> GenerateVerificationTokenAsync(string userId)
    {
        // Invalidate any existing tokens for this user
        var existingTokens = await _context.EmailVerificationTokens
            .Where(t => t.UserId == userId && !t.IsUsed)
            .ToListAsync();

        foreach (var token in existingTokens)
        {
            token.IsUsed = true;
            token.UsedAt = DateTime.UtcNow;
        }

        // Generate new token
        var newToken = new EmailVerificationToken
        {
            UserId = userId,
            Token = _tokenService.GenerateUrlSafeToken(),
            ExpiresAt = DateTime.UtcNow.AddMinutes(_tokenExpiryMinutes),
            CreatedAt = DateTime.UtcNow
        };

        _context.EmailVerificationTokens.Add(newToken);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Generated verification token for user {UserId}", userId);

        return newToken.Token;
    }

    public async Task<bool> VerifyEmailAsync(string token)
    {
        var verificationToken = await _context.EmailVerificationTokens
            .FirstOrDefaultAsync(t => t.Token == token);

        if (verificationToken == null)
        {
            _logger.LogWarning("Verification token not found: {Token}", token);
            return false;
        }

        if (!verificationToken.IsValid)
        {
            _logger.LogWarning(
                "Invalid verification token for user {UserId}: IsUsed={IsUsed}, IsExpired={IsExpired}",
                verificationToken.UserId,
                verificationToken.IsUsed,
                verificationToken.IsExpired);
            return false;
        }

        // Get user using UserManager
        var user = await _userManager.FindByIdAsync(verificationToken.UserId);
        if (user == null)
        {
            _logger.LogWarning("User not found for verification token: {Token}", token);
            return false;
        }

        // Mark token as used
        verificationToken.IsUsed = true;
        verificationToken.UsedAt = DateTime.UtcNow;

        // Mark user email as confirmed
        user.EmailConfirmed = true;
        user.EmailConfirmedAt = DateTime.UtcNow;

        await _userManager.UpdateAsync(user);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Email verified successfully for user {UserId}", verificationToken.UserId);

        return true;
    }

    public async Task<bool> ResendVerificationEmailAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);

        if (user == null)
        {
            _logger.LogWarning("Resend verification requested for non-existent email: {Email}", email);
            // Return true to prevent email enumeration
            return true;
        }

        if (user.EmailConfirmed)
        {
            _logger.LogInformation("Resend verification requested for already-verified email: {Email}", email);
            return true;
        }

        // Generate new token
        var token = await GenerateVerificationTokenAsync(user.Id);
        var verificationLink = $"{_baseUrl}/verify-email?token={token}";

        // Send email
        var emailSent = await _emailService.SendVerificationEmailAsync(
            user.Email!,
            user.FirstName,
            verificationLink);

        if (!emailSent)
        {
            _logger.LogError("Failed to send verification email to {Email}", email);
            return false;
        }

        return true;
    }
}

