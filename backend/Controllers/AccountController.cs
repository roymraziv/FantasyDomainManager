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
using Microsoft.Extensions.Hosting;

namespace FantasyDomainManager.Controllers;

public class AccountController(ITokenService tokenService, UserManager<User> userManager, DomainDb context, IHostEnvironment environment, InputSanitizationService sanitizer) : BaseApiController(context)
{
    private readonly IHostEnvironment _environment = environment;

    [HttpPost("register")]
    [EnableRateLimiting("RegisterPolicy")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto dto)
    {
        // Sanitize inputs
        var sanitizedFirstName = sanitizer.StripHtml(dto.FirstName);
        var sanitizedLastName = sanitizer.StripHtml(dto.LastName);

        var user = new User { Email = dto.Email.ToLower(), UserName = dto.Email, FirstName = sanitizedFirstName, LastName = sanitizedLastName };

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

        await SetRefreshTokenCookie(user);
        var userDto = await user.ToDto(tokenService);
        SetAccessTokenCookie(userDto.Token);

        return userDto;
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
}
