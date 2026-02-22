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
    public DbSet<ServiceNeed> ServiceNeeds { get; set; }

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

        modelBuilder.Entity<ServiceNeed>()
            .Property(sn => sn.Price)
            .HasColumnType("decimal(18,2)");

        // Seed default service needs
        modelBuilder.Entity<ServiceNeed>().HasData(
            new ServiceNeed { Id = 1,  Name = "Обработка на седла",       Price = 150m, IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new ServiceNeed { Id = 2,  Name = "Смяна на водачи",          Price = 200m, IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new ServiceNeed { Id = 3,  Name = "Шлифоване на повърхност",  Price = 120m, IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new ServiceNeed { Id = 4,  Name = "Тест за пукнатини",        Price = 80m,  IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new ServiceNeed { Id = 5,  Name = "Почистване и измиване",    Price = 60m,  IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new ServiceNeed { Id = 6,  Name = "Тест на пружини",          Price = 50m,  IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new ServiceNeed { Id = 7,  Name = "Смяна на уплътнения",      Price = 90m,  IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new ServiceNeed { Id = 8,  Name = "Портинг и полиране",       Price = 300m, IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new ServiceNeed { Id = 9,  Name = "Монтажни дейности",        Price = 180m, IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new ServiceNeed { Id = 10, Name = "Тест под налягане",        Price = 100m, IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        base.OnModelCreating(modelBuilder);
    }
}
