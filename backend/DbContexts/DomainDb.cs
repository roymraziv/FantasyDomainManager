using FantasyDomainManager.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FantasyDomainManager.DbContexts;

public class DomainDb : IdentityDbContext<User>
{
    public DomainDb(DbContextOptions<DomainDb> options) : base(options)
    {
    }

    public DbSet<Domain> Domains { get; set; }
    public DbSet<Enterprise> Enterprises { get; set; }
    public DbSet<Hero> Heroes { get; set; }
    public DbSet<Troop> Troops { get; set; }
    public DbSet<EmailVerificationToken> EmailVerificationTokens { get; set; }
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<IdentityRole>()
            .HasData(
                new IdentityRole{Id = "member-id", Name = "Member", NormalizedName = "MEMBER"},
                new IdentityRole{Id = "admin-id", Name = "Admin", NormalizedName = "ADMIN"}
            );

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Domain>()
            .HasIndex(d => d.UserId);

        modelBuilder.Entity<Enterprise>()
            .HasIndex(e => e.DomainId);

        modelBuilder.Entity<Hero>()
            .HasIndex(h => h.DomainId);

        modelBuilder.Entity<Troop>()
            .HasIndex(t => t.DomainId);
        
        modelBuilder.Entity<EmailVerificationToken>(entity =>
        {
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasIndex(e => new { e.UserId, e.CreatedAt });
            entity.HasIndex(e => e.ExpiresAt);
        });

        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasIndex(e => new { e.UserId, e.CreatedAt });
            entity.HasIndex(e => e.ExpiresAt);
        });
    }
}
