using FantasyDomainManager.DbContexts;
using FantasyDomainManager.DTOs;
using FantasyDomainManager.Extensions;
using FantasyDomainManager.Interfaces;
using FantasyDomainManager.Models;
using FantasyDomainManager.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace FantasyDomainManager.Controllers;

public class AccountController(
    ITokenService tokenService,
    UserManager<User> userManager,
    DomainDb context,
    IHostEnvironment environment,
    InputSanitizationService sanitizer,
    IEmailVerificationService emailVerificationService,
    IPasswordResetService passwordResetService,
    IEmailService emailService,
    IConfiguration configuration) : BaseApiController(context)
{
    private readonly IHostEnvironment _environment = environment;

    [HttpPost("register")]
    [EnableRateLimiting("RegisterPolicy")]
    public async Task<ActionResult> Register(RegisterDto dto)
    {
        // Sanitize inputs
        var sanitizedFirstName = sanitizer.StripHtml(dto.FirstName);
        var sanitizedLastName = sanitizer.StripHtml(dto.LastName);

        var user = new User
        {
            Email = dto.Email.ToLower(),
            UserName = dto.Email,
            FirstName = sanitizedFirstName,
            LastName = sanitizedLastName,
            EmailConfirmed = false // Require email verification
        };

        var result = await userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        var roleResult = await userManager.AddToRoleAsync(user, "Member");
        if (!roleResult.Succeeded)
        {
            return BadRequest(roleResult.Errors);
        }

        // Generate verification token and send email
        var verificationToken = await emailVerificationService.GenerateVerificationTokenAsync(user.Id);
        var baseUrl = configuration["Email:BaseUrl"] ?? "https://fantasydomainmanager.com";
        var verificationLink = $"{baseUrl}/verify-email?token={verificationToken}";

        await emailService.SendVerificationEmailAsync(user.Email!, user.FirstName, verificationLink);

        // Return success message instead of auto-login
        return Ok(new
        {
            message = "Registration successful. Please check your email to verify your account.",
            email = user.Email
        });
    }

    [HttpPost("login")]
    [EnableRateLimiting("LoginPolicy")]
    public async Task<ActionResult<UserDto>> Login(LoginDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        if (await userManager.IsLockedOutAsync(user))
        {
            return Unauthorized(new { message = "Account is temporarily locked due to multiple failed login attempts. Please try again later." });
        }

        // Check if email is verified
        if (!user.EmailConfirmed)
        {
            return Unauthorized(new
            {
                message = "Please verify your email address before logging in",
                requiresVerification = true
            });
        }

        var result = await userManager.CheckPasswordAsync(user, dto.Password);

        if (!result)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        await SetRefreshTokenCookie(user);
        var userDto = await user.ToDto(tokenService);
        SetAccessTokenCookie(userDto.Token);

        return userDto;
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<UserDto>> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(new { message = "No refresh token found" });
        }

        var user = await userManager.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken
                                      && u.RefreshTokenExpiry > DateTime.UtcNow);

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid or expired refresh token" });
        }

        await SetRefreshTokenCookie(user);
        var userDto = await user.ToDto(tokenService);
        SetAccessTokenCookie(userDto.Token);

        return userDto;
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        // Invalidate refresh token in database if user is authenticated
        var user = GetAuthenticatedUser(out var error);
        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiry = null;
            await userManager.UpdateAsync(user);
        }

        // Delete cookies with matching options to ensure proper deletion
        // Always delete cookies even if user is not authenticated (defense in depth)
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !_environment.IsDevelopment(), // Must match the Secure setting used when creating cookies
            SameSite = SameSiteMode.Lax
        };

        Response.Cookies.Delete("accessToken", cookieOptions);
        Response.Cookies.Delete("refreshToken", cookieOptions);
        return Ok("Logged out successfully");
    }

    private void SetAccessTokenCookie(string token)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !_environment.IsDevelopment(), // Secure in production (HTTPS), false in development (HTTP)
            SameSite = SameSiteMode.Lax, // Lax works with Safari on different ports
            Expires = DateTime.UtcNow.AddMinutes(30)
        };

        Response.Cookies.Append("accessToken", token, cookieOptions);
    }

    private async Task SetRefreshTokenCookie(User user)
    {
        var refreshToken = tokenService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await userManager.UpdateAsync(user);

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !_environment.IsDevelopment(), // Secure in production (HTTPS), false in development (HTTP)
            SameSite = SameSiteMode.Lax, // Lax works with Safari on different ports
            Expires = DateTime.Now.AddDays(7)
        };

        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await emailVerificationService.VerifyEmailAsync(dto.Token);

        if (!result)
            return BadRequest(new { message = "Invalid or expired verification token" });

        return Ok(new { message = "Email verified successfully" });
    }

    [HttpPost("resend-verification")]
    [EnableRateLimiting("ResendVerificationPolicy")]
    public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await emailVerificationService.ResendVerificationEmailAsync(dto.Email);

        // Always return success to prevent email enumeration
        return Ok(new { message = "If an account exists, a verification email has been sent" });
    }

    [HttpPost("forgot-password")]
    [EnableRateLimiting("ForgotPasswordPolicy")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var result = await passwordResetService.RequestPasswordResetAsync(dto.Email, ipAddress);

        // Always return success to prevent email enumeration
        return Ok(new { message = "If an account exists, a password reset email has been sent" });
    }

    [HttpPost("reset-password")]
    [EnableRateLimiting("ResetPasswordPolicy")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await passwordResetService.ResetPasswordAsync(dto.Token, dto.NewPassword);

        if (!result)
            return BadRequest(new { message = "Invalid or expired reset token" });

        return Ok(new { message = "Password reset successfully. Please log in with your new password." });
    }

    [HttpGet("validate-reset-token")]
    public async Task<IActionResult> ValidateResetToken([FromQuery] string token)
    {
        if (string.IsNullOrEmpty(token))
            return BadRequest(new { message = "Token is required" });

        var isValid = await passwordResetService.ValidateResetTokenAsync(token);

        if (!isValid)
            return BadRequest(new { message = "Invalid or expired token" });

        return Ok(new { message = "Token is valid" });
    }
}
