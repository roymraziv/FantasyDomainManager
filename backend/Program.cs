using FantasyDomainManager.DbContexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;
using FantasyDomainManager.Validators;
using FluentValidation;
using FluentValidation.AspNetCore;
using FantasyDomainManager.Interfaces;
using FantasyDomainManager.Services;

var builder = WebApplication.CreateBuilder(args);

var GetConnectionString = builder.Configuration.GetConnectionString("Domains") ?? "Data Source=domains.db";

builder.Services.AddDbContext<DomainDb>(options =>
    options.UseSqlite(GetConnectionString));

// Register services
builder.Services.AddScoped<FinancialCalculationService>();
builder.Services.AddScoped<ITokenService, TokenService>();

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<DomainValidator>();

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

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Fantasy Domain Manager API v1");
    });
}

// Enable CORS
app.UseCors("AllowFrontend");

app.MapControllers();

app.Run();
