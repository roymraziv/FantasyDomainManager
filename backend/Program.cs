using FantasyDomainManager.DbContexts;
using FantasyDomainManager.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;
using FantasyDomainManager.Validators;
using FluentValidation;
using FluentValidation.AspNetCore;
using FantasyDomainManager.Interfaces;
using FantasyDomainManager.Models;
using FantasyDomainManager.Services;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

var getConnectionString = builder.Configuration.GetConnectionString("Domains") 
    ?? throw new InvalidOperationException("Connection string 'Domains' is required. Please configure it in appsettings.json or environment variables.");

// Configure database provider - PostgreSQL only
builder.Services.AddDbContext<DomainDb>(options =>
{
    options.UseNpgsql(getConnectionString);
});

// Register configuration
builder.Services.Configure<AdminSeedSettings>(builder.Configuration.GetSection("AdminSeed"));

// Register services
builder.Services.AddScoped<FinancialCalculationService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<DatabaseSeeder>();
builder.Services.AddScoped<InputSanitizationService>();

// Email and verification services
builder.Services.AddScoped<IEmailService, AwsSesEmailService>();
builder.Services.AddScoped<ITokenGenerationService, TokenGenerationService>();
builder.Services.AddScoped<IEmailVerificationService, EmailVerificationService>();
builder.Services.AddScoped<IPasswordResetService, PasswordResetService>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var tokenKey = builder.Configuration["TokenKey"] ?? throw new Exception("Token key not found in configuration");
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(tokenKey)),
            ValidateIssuer = true,
            ValidIssuer = "FantasyDomainManager",
            ValidateAudience = true,
            ValidAudience = "FantasyDomainManager.Client"
        };

        // Read JWT from cookie
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // Check for token in cookie first
                if (context.Request.Cookies.ContainsKey("accessToken"))
                {
                    context.Token = context.Request.Cookies["accessToken"];
                }
                // Fallback to Authorization header (for backwards compatibility)
                else if (context.Request.Headers.ContainsKey("Authorization"))
                {
                    var authHeader = context.Request.Headers["Authorization"].ToString();
                    if (authHeader.StartsWith("Bearer "))
                    {
                        context.Token = authHeader.Substring("Bearer ".Length).Trim();
                    }
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            // Get allowed origins: check environment variable first, then appsettings, then default
            string[]? allowedOrigins = null;
            
            // Check environment variable (supports both CORS__AllowedOrigins and CORS:AllowedOrigins formats)
            var envOrigins = builder.Configuration["CORS:AllowedOrigins"] 
                ?? builder.Configuration["CORS__AllowedOrigins"];
            
            if (!string.IsNullOrWhiteSpace(envOrigins))
            {
                // Parse comma-separated values from environment variable
                allowedOrigins = envOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(origin => origin.Trim())
                    .Where(origin => !string.IsNullOrWhiteSpace(origin))
                    .ToArray();
            }
            
            // Fall back to appsettings if environment variable not set
            if (allowedOrigins == null || allowedOrigins.Length == 0)
            {
                allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();
            }
            
            // Default to localhost if nothing is configured
            if (allowedOrigins == null || allowedOrigins.Length == 0)
            {
                allowedOrigins = new[] { "http://localhost:3000" };
            }
            
            policy.WithOrigins(allowedOrigins)
                  .WithHeaders("Content-Type", "Authorization")
                  .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                  .AllowCredentials();
        });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateDomainDtoValidator>();
builder.Services.AddIdentityCore<User>(opt =>
{
    opt.User.RequireUniqueEmail = true;
    opt.Lockout.MaxFailedAccessAttempts = 5;
    opt.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    opt.Lockout.AllowedForNewUsers = true;
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<DomainDb>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Fantasy Domain Manager API",
        Description = "API for managing fantasy domains and related entities.",
        Version = "v1"
    });
});

// Configure rate limiting
builder.Services.AddRateLimiter(options =>
{
    // Login policy: 5 attempts per 15 minutes per IP
    options.AddPolicy<string>("LoginPolicy", context =>
    {
        // Partition by IP address for login
        var partitionKey = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetSlidingWindowLimiter(partitionKey, _ => new SlidingWindowRateLimiterOptions
        {
            PermitLimit = 5,
            Window = TimeSpan.FromMinutes(15),
            SegmentsPerWindow = 3,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0,
            AutoReplenishment = true
        });
    });

    // Register policy: 3 attempts per hour per IP
    options.AddPolicy<string>("RegisterPolicy", context =>
    {
        // Partition by IP address for register
        var partitionKey = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(partitionKey, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 3,
            Window = TimeSpan.FromHours(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0,
            AutoReplenishment = true
        });
    });

    // API policy: 100 requests per minute per user/IP
    options.AddPolicy<string>("ApiPolicy", context =>
    {
        // For authenticated users, use user ID; otherwise use IP address
        string partitionKey;
        var user = context.User;
        if (user?.Identity != null && user.Identity.IsAuthenticated && user.Identity.Name != null)
        {
            partitionKey = user.Identity.Name;
        }
        else
        {
            partitionKey = context.Connection.RemoteIpAddress?.ToString() ?? "anonymous";
        }
        return RateLimitPartition.GetSlidingWindowLimiter(partitionKey, _ => new SlidingWindowRateLimiterOptions
        {
            PermitLimit = 100,
            Window = TimeSpan.FromMinutes(1),
            SegmentsPerWindow = 4,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0,
            AutoReplenishment = true
        });
    });

    // Forgot password policy: 3 attempts per hour per IP
    options.AddPolicy<string>("ForgotPasswordPolicy", context =>
    {
        var partitionKey = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(partitionKey, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 3,
            Window = TimeSpan.FromHours(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0,
            AutoReplenishment = true
        });
    });

    // Reset password policy: 5 attempts per hour per IP
    options.AddPolicy<string>("ResetPasswordPolicy", context =>
    {
        var partitionKey = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(partitionKey, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 5,
            Window = TimeSpan.FromHours(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0,
            AutoReplenishment = true
        });
    });

    // Resend verification policy: 3 attempts per hour per IP
    options.AddPolicy<string>("ResendVerificationPolicy", context =>
    {
        var partitionKey = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(partitionKey, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 3,
            Window = TimeSpan.FromHours(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0,
            AutoReplenishment = true
        });
    });

    // Configure rejection response
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        
        // Calculate retry after based on the rate limiter's retry after or default to 60 seconds
        var retryAfter = 60;
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfterValue))
        {
            retryAfter = (int)retryAfterValue.TotalSeconds;
        }
        context.HttpContext.Response.Headers.RetryAfter = retryAfter.ToString();

        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            message = "Too many requests. Please try again later.",
            retryAfter
        }, cancellationToken);
    };
});

var app = builder.Build();

// Seed database with admin user and roles
using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
    await seeder.SeedAsync();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Fantasy Domain Manager API v1");
    });
}

// Enforce HTTPS redirection
app.UseHttpsRedirection();

// Add HSTS (HTTP Strict Transport Security) headers in production
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

// Enable CORS
app.UseCors("AllowFrontend");

// Add Content-Security-Policy headers
app.Use(async (context, next) =>
{
    // Strict CSP policy: prevent inline scripts and only allow same-origin resources
    context.Response.Headers.Append("Content-Security-Policy", 
        "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; " +
        "font-src 'self'; " +
        "connect-src 'self'; " +
        "frame-ancestors 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'");
    
    await next();
});

// Enable rate limiting
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
