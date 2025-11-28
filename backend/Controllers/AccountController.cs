using FantasyDomainManager.DbContexts;
using FantasyDomainManager.DTOs;
using FantasyDomainManager.Extensions;
using FantasyDomainManager.Interfaces;
using FantasyDomainManager.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FantasyDomainManager.Controllers;

public class AccountController(ITokenService tokenService, UserManager<User> userManager, DomainDb context) : BaseApiController(context)
{

    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto dto)
    {

        var user = new User { Email = dto.Email.ToLower(), UserName = dto.Email, FirstName = dto.FirstName, LastName = dto.LastName };

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
    public async Task<ActionResult<UserDto>> Login(LoginDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid email or password" });
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
    public IActionResult Logout()
    {
        // Delete cookies with matching options to ensure proper deletion
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // Must match the Secure setting used when creating cookies
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
            Secure = false, // Development: HTTP (set to true in production with HTTPS)
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
            Secure = false, // Development: HTTP (set to true in production with HTTPS)
            SameSite = SameSiteMode.Lax, // Lax works with Safari on different ports
            Expires = DateTime.Now.AddDays(7)
        };

        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }
}
