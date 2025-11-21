using System;
using System.Security.Cryptography;
using FantasyDomainManager.DTOs;
using FantasyDomainManager.Extensions;
using FantasyDomainManager.Interfaces;
using FantasyDomainManager.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FantasyDomainManager.Controllers;

public class AccountController(DbContexts.DomainDb context, ITokenService tokenService) : BaseApiController
{

    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (await context.Users.AnyAsync(u => u.Email == dto.Email.ToLower()))
        {
            return BadRequest(new { message = "Email is already registered" });
        }

        using var hmac = new HMACSHA512();

        var user = new User
        {
            Email = dto.Email.ToLower(),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PasswordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(dto.Password)),
            PasswordSalt = hmac.Key
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();
        return user.ToDto(tokenService);
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto dto)
    {
        var user = await context.Users.SingleOrDefaultAsync(u => u.Email == dto.Email.ToLower());

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid email address" });
        }

        using var hmac = new HMACSHA512(user.PasswordSalt);
        var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(dto.Password));


        for (int i = 0; i < computedHash.Length; i++)
        {
            if (computedHash[i] != user.PasswordHash[i])
            {
                return Unauthorized(new { message = "Invalid email address or password" });
            }
        }

        return user.ToDto(tokenService);

    }
}
