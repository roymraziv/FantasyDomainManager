using System;
using System.Security.Cryptography;
using FantasyDomainManager.DTOs;
using FantasyDomainManager.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FantasyDomainManager.Controllers;

public class AccountController : BaseApiController
{
    private readonly DbContexts.DomainDb _context;

    public AccountController(DbContexts.DomainDb context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<ActionResult<User>> Register(RegisterDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (await _context.Users.AnyAsync(u => u.Email == dto.Email.ToLower()))
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

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    [HttpPost("login")]
    public async Task<ActionResult<User>> Login(LoginDto dto)
    {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == dto.Email.ToLower());

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

        return user;

    }
}
