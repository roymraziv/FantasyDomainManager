using FantasyDomainManager.Configuration;
using FantasyDomainManager.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace FantasyDomainManager.Services;

public class DatabaseSeeder
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly AdminSeedSettings _adminSettings;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(
        UserManager<User> userManager,
        RoleManager<IdentityRole> roleManager,
        IOptions<AdminSeedSettings> adminSettings,
        ILogger<DatabaseSeeder> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _adminSettings = adminSettings.Value;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            // Create roles if they don't exist
            await EnsureRolesAsync();

            // Create admin user if configured and doesn't exist
            await EnsureAdminUserAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database");
            throw;
        }
    }

    private async Task EnsureRolesAsync()
    {
        string[] roles = { "Admin", "Member" };

        foreach (var roleName in roles)
        {
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                var result = await _roleManager.CreateAsync(new IdentityRole(roleName));
                if (result.Succeeded)
                {
                    _logger.LogInformation("Created role: {Role}", roleName);
                }
                else
                {
                    _logger.LogError("Failed to create role: {Role}. Errors: {Errors}",
                        roleName, string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }
        }
    }

    private async Task EnsureAdminUserAsync()
    {
        // Validate admin settings are configured
        if (string.IsNullOrWhiteSpace(_adminSettings.Email) ||
            string.IsNullOrWhiteSpace(_adminSettings.Password))
        {
            _logger.LogWarning("Admin user credentials not configured. Skipping admin user creation.");
            return;
        }

        // Check if admin user already exists
        var existingAdmin = await _userManager.FindByEmailAsync(_adminSettings.Email);
        if (existingAdmin != null)
        {
            _logger.LogInformation("Admin user already exists: {Email}", _adminSettings.Email);
            return;
        }

        // Create admin user
        var adminUser = new User
        {
            UserName = _adminSettings.Email,
            Email = _adminSettings.Email,
            FirstName = _adminSettings.FirstName,
            LastName = _adminSettings.LastName,
            EmailConfirmed = true // Auto-confirm admin email
        };

        var result = await _userManager.CreateAsync(adminUser, _adminSettings.Password);

        if (result.Succeeded)
        {
            // Add to Admin role
            var roleResult = await _userManager.AddToRoleAsync(adminUser, "Admin");

            if (roleResult.Succeeded)
            {
                _logger.LogInformation("Admin user created successfully: {Email}", _adminSettings.Email);
            }
            else
            {
                _logger.LogError("Failed to add admin user to Admin role. Errors: {Errors}",
                    string.Join(", ", roleResult.Errors.Select(e => e.Description)));
            }
        }
        else
        {
            _logger.LogError("Failed to create admin user. Errors: {Errors}",
                string.Join(", ", result.Errors.Select(e => e.Description)));
        }
    }
}
