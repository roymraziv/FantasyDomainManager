using FantasyDomainManager.Infrastructure.DbContexts;
using FantasyDomainManager.Core.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;
using FantasyDomainManager.Core.Validators;
using FluentValidation;
using FluentValidation.AspNetCore;
using FantasyDomainManager.Core.Interfaces;
using FantasyDomainManager.Core.Models;
using FantasyDomainManager.Core.Services;
using FantasyDomainManager.Infrastructure.Services;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using System.Threading.RateLimiting;

namespace FantasyDomainManager.Api;

/// <summary>
/// Configures the app for Lambda (used by LambdaEntryPoint). Keeps the same configuration as Program.cs so Lambda and local run behave the same.
/// </summary>
public class Startup
{
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    public void ConfigureServices(IServiceCollection services)
    {
        var getConnectionString = Configuration.GetConnectionString("Domains")
            ?? throw new InvalidOperationException("Connection string 'Domains' is required.");

        services.AddDbContext<DomainDb>(options => options.UseNpgsql(getConnectionString));
        services.Configure<AdminSeedSettings>(Configuration.GetSection("AdminSeed"));

        services.AddScoped<FinancialCalculationService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<DatabaseSeeder>();
        services.AddScoped<InputSanitizationService>();
        services.AddScoped<IEmailService, AwsSesEmailService>();
        services.AddScoped<ITokenGenerationService, TokenGenerationService>();
        services.AddScoped<IEmailVerificationService, EmailVerificationService>();
        services.AddScoped<IPasswordResetService, PasswordResetService>();

        var tokenKey = Configuration["TokenKey"] ?? throw new InvalidOperationException("Token key not found in configuration");
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(tokenKey)),
                    ValidateIssuer = true,
                    ValidIssuer = "FantasyDomainManager",
                    ValidateAudience = true,
                    ValidAudience = "FantasyDomainManager.Client"
                };
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        if (context.Request.Cookies.ContainsKey("accessToken"))
                            context.Token = context.Request.Cookies["accessToken"];
                        else if (context.Request.Headers.ContainsKey("Authorization"))
                        {
                            var authHeader = context.Request.Headers["Authorization"].ToString();
                            if (authHeader.StartsWith("Bearer "))
                                context.Token = authHeader.Substring("Bearer ".Length).Trim();
                        }
                        return Task.CompletedTask;
                    }
                };
            });

        services.AddAuthorization(options =>
            options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin")));

        // CORS
        string[]? allowedOrigins = null;
        var envOrigins = Configuration["CORS:AllowedOrigins"] ?? Configuration["CORS__AllowedOrigins"];
        if (!string.IsNullOrWhiteSpace(envOrigins))
            allowedOrigins = envOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(o => o.Trim()).Where(o => !string.IsNullOrWhiteSpace(o)).ToArray();
        if (allowedOrigins == null || allowedOrigins.Length == 0)
            allowedOrigins = Configuration.GetSection("AllowedOrigins").Get<string[]>();
        if (allowedOrigins == null || allowedOrigins.Length == 0)
            allowedOrigins = new[] { "http://localhost:3000" };

        services.AddCors(options =>
            options.AddPolicy("AllowFrontend", policy =>
                policy.WithOrigins(allowedOrigins)
                    .WithHeaders("Content-Type", "Authorization")
                    .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .AllowCredentials()));

        services.AddControllers()
            .AddJsonOptions(opts => opts.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

        services.AddFluentValidationAutoValidation();
        services.AddValidatorsFromAssemblyContaining<CreateDomainDtoValidator>();

        services.AddIdentityCore<User>(opt =>
        {
            opt.User.RequireUniqueEmail = true;
            opt.Lockout.MaxFailedAccessAttempts = 5;
            opt.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            opt.Lockout.AllowedForNewUsers = true;
        })
        .AddRoles<IdentityRole>()
        .AddEntityFrameworkStores<DomainDb>();

        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "Fantasy Domain Manager API", Description = "API for managing fantasy domains.", Version = "v1" }));

        // Rate limiting
        services.AddRateLimiter(options =>
        {
            options.AddPolicy<string>("LoginPolicy", context => RateLimitPartition.GetSlidingWindowLimiter(
                context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new SlidingWindowRateLimiterOptions { PermitLimit = 5, Window = TimeSpan.FromMinutes(15), SegmentsPerWindow = 3, QueueProcessingOrder = QueueProcessingOrder.OldestFirst, QueueLimit = 0, AutoReplenishment = true }));
            options.AddPolicy<string>("RegisterPolicy", context => RateLimitPartition.GetFixedWindowLimiter(
                context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new FixedWindowRateLimiterOptions { PermitLimit = 3, Window = TimeSpan.FromHours(1), QueueProcessingOrder = QueueProcessingOrder.OldestFirst, QueueLimit = 0, AutoReplenishment = true }));
            options.AddPolicy<string>("ApiPolicy", context =>
            {
                var key = context.User?.Identity?.IsAuthenticated == true && context.User.Identity.Name != null ? context.User.Identity.Name : context.Connection.RemoteIpAddress?.ToString() ?? "anonymous";
                return RateLimitPartition.GetSlidingWindowLimiter(key, _ => new SlidingWindowRateLimiterOptions { PermitLimit = 100, Window = TimeSpan.FromMinutes(1), SegmentsPerWindow = 4, QueueProcessingOrder = QueueProcessingOrder.OldestFirst, QueueLimit = 0, AutoReplenishment = true });
            });
            options.AddPolicy<string>("ForgotPasswordPolicy", context => RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions { PermitLimit = 3, Window = TimeSpan.FromHours(1), QueueProcessingOrder = QueueProcessingOrder.OldestFirst, QueueLimit = 0, AutoReplenishment = true }));
            options.AddPolicy<string>("ResetPasswordPolicy", context => RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions { PermitLimit = 5, Window = TimeSpan.FromHours(1), QueueProcessingOrder = QueueProcessingOrder.OldestFirst, QueueLimit = 0, AutoReplenishment = true }));
            options.AddPolicy<string>("ResendVerificationPolicy", context => RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions { PermitLimit = 3, Window = TimeSpan.FromHours(1), QueueProcessingOrder = QueueProcessingOrder.OldestFirst, QueueLimit = 0, AutoReplenishment = true }));
            options.OnRejected = async (context, ct) =>
            {
                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                var retryAfter = 60;
                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var v)) retryAfter = (int)v.TotalSeconds;
                context.HttpContext.Response.Headers.RetryAfter = retryAfter.ToString();
                await context.HttpContext.Response.WriteAsJsonAsync(new { message = "Too many requests. Please try again later.", retryAfter }, ct);
            };
        });
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Fantasy Domain Manager API v1"));
        }

        if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("AWS_LAMBDA_FUNCTION_NAME")))
        {
            app.UseHttpsRedirection();
        }
        if (!env.IsDevelopment())
            app.UseHsts();

        app.UseCors("AllowFrontend");
        app.Use(async (context, next) =>
        {
            context.Response.Headers.Append("Content-Security-Policy",
                "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
            await next();
        });
        app.UseRateLimiter();
        app.UseAuthentication();
        app.UseRouting();
        app.UseAuthorization();
        app.UseEndpoints(endpoints => endpoints.MapControllers());
    }
}
