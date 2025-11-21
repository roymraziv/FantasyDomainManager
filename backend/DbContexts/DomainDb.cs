using System;
using Microsoft.EntityFrameworkCore;

namespace FantasyDomainManager.DbContexts;

public class DomainDb : DbContext
{
    public DomainDb(DbContextOptions<DomainDb> options) : base(options)
    {
    }

    public DbSet<Models.Domain> Domains { get; set; }
    public DbSet<Models.Enterprise> Enterprises { get; set; }
    public DbSet<Models.Hero> Heroes { get; set; }
    public DbSet<Models.Troop> Troops { get; set; }
    public DbSet<Models.User> Users { get; set; }

    
}
