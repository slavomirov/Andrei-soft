using AndreiSoftAPI.Data;
using AndreiSoftAPI.Data.DTOs;
using AndreiSoftAPI.Data.Models;
using AndreiSoftAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AndreiSoftAPI.Services;
public class HeadsService : IHeadsService
{
    private readonly AppDbContext _db;
    private readonly StatusLoggerService _logger;

    public HeadsService(AppDbContext db, StatusLoggerService logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<Head>> GetAllAsync()
    {
        return await _db.Heads
            .Include(h => h.AssignedWorker)
            .Include(h => h.StatusLogs)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();
    }

    public async Task<Head?> GetByIdAsync(int id)
    {
        return await _db.Heads
            .Include(h => h.AssignedWorker)
            .Include(h => h.StatusLogs)
            .FirstOrDefaultAsync(h => h.Id == id) ?? throw new Exception("Item not found!");
    }

    public async Task<Head> CreateAsync(CreateHeadDTO dto, string userId)
    {
        var head = new Head
        {
            Actions = dto.Actions,
            AssignedWorkerId = dto.AssignedWorkerId,
            Description = dto.Description,
            Price = dto.Price,
            Status = HeadStatus.Received,
        };

        _db.Heads.Add(head);
        await _db.SaveChangesAsync();

        await _logger.LogStatusChange(head.Id, head, userId);

        return head;
    }

    public async Task<Head> UpdateAsync(int id, UpdateHeadDTO input)
    {
        var head = await _db.Heads.FindAsync(id) ?? throw new Exception("Item not found!");

        head.Description = input.Description;
        head.Actions = input.Actions;
        head.Price = input.Price;
        head.Status = input.Status;
        head.AssignedWorkerId = input.AssignedWorkerId;

        head.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return head;
    }

    public async Task DeleteAsync(int id)
    {
        var head = await _db.Heads.FindAsync(id) ?? throw new Exception("Item not found!");

        _db.Heads.Remove(head);
        await _db.SaveChangesAsync();
    }

    public async Task<Head?> AssignAsync(int headId, string workerId, string changedByUserId)
    {
        var head = await _db.Heads.FindAsync(headId) ?? throw new Exception("Item not found!");

        head.AssignedWorkerId = workerId;
        head.Status = HeadStatus.Assigned;
        head.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _logger.LogStatusChange(head.Id, head, changedByUserId);

        return head;
    }

    public async Task<Head?> ChangeStatusAsync(int headId, HeadStatus newStatus, string userId)
    {
        var head = await _db.Heads.FindAsync(headId) ?? throw new Exception("Item not found!");

        head.Status = newStatus;
        head.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _logger.LogStatusChange(head.Id, head, userId);

        return head;
    }
}
