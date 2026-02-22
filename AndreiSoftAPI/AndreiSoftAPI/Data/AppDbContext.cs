using AndreiSoftAPI.Data.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AndreiSoftAPI.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) 
        : base(options)
    {
    }

    public DbSet<Head> Heads { get; set; }
    public DbSet<HeadStatusLog> Logs { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) 
    { 
        modelBuilder.Entity<Head>()
            .HasMany(h => h.StatusLogs)
            .WithOne(h => h.Head)
            .HasForeignKey(h => h.HeadId); 
        
        modelBuilder.Entity<ApplicationUser>()
            .HasMany(u => u.Heads)
            .WithOne(h => h.Mechanic)
            .HasForeignKey(h => h.MechanicId); 

        modelBuilder.Entity<HeadStatusLog>()
            .HasOne(l => l.ChangedByUser)
            .WithMany()
            .HasForeignKey(l => l.ChangedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Head>()
            .Property(h => h.Price)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<HeadStatusLog>()
            .Property(l => l.Price)
            .HasColumnType("decimal(18,2)");

        base.OnModelCreating(modelBuilder);
    }
}
