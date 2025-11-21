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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Index on User.Email for fast login lookups
        modelBuilder.Entity<Models.User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Index on Domain.UserId for filtering domains by user
        modelBuilder.Entity<Models.Domain>()
            .HasIndex(d => d.UserId);

        // Indexes on foreign keys for better query performance
        modelBuilder.Entity<Models.Enterprise>()
            .HasIndex(e => e.DomainId);

        modelBuilder.Entity<Models.Hero>()
            .HasIndex(h => h.DomainId);

        modelBuilder.Entity<Models.Troop>()
            .HasIndex(t => t.DomainId);
    }
}
