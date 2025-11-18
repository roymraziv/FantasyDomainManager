using FantasyDomainManager.DbContexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

var GetConnectionString = builder.Configuration.GetConnectionString("Domains") ?? "Data Source=domains.db";

builder.Services.AddDbContext<DomainDb>(options =>
    options.UseSqlite(GetConnectionString));

builder.Services.AddControllers();

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

app.MapControllers();

app.Run();
