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
            .HasMany(w => w.Heads)
            .WithOne(h => h.AssignedWorker)
            .HasForeignKey(h => h.AssignedWorkerId); 

        modelBuilder.Entity<HeadStatusLog>()
            .HasOne(l => l.ChangedByUser)
            .WithMany()
            .HasForeignKey(l => l.ChangedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        base.OnModelCreating(modelBuilder);
    }
}
