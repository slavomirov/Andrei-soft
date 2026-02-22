using AndreiSoftAPI.Data;
using AndreiSoftAPI.Data.DTOs;
using AndreiSoftAPI.Data.Models;
using AndreiSoftAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AndreiSoftAPI.Services;

public class StatusLoggerService : IStatusLoggerService
{
    private readonly AppDbContext _dbContext;

    public StatusLoggerService(AppDbContext db)
    {
        _dbContext = db;
    }

    public async Task LogAsync(Head head, string action, string description, string? userId, string? userDisplayName)
    {
        var log = new HeadStatusLog
        {
            HeadId = head.Id,
            HeadSummary = $"{head.Make} {head.Model} ({head.Year})",
            Action = action,
            Description = description,
            Status = head.Status,
            MechanicId = head.MechanicId,
            MechanicDisplayName = head.MechanicDisplayName,
            ChangedByUserId = userId,
            ChangedByDisplayName = userDisplayName,
            Price = head.Price,
        };

        _dbContext.Logs.Add(log);
        await _dbContext.SaveChangesAsync();
    }

    // ── Queries ─────────────────────────────────────────────────
    private static HistoryEntryDTO MapToDTO(HeadStatusLog log) => new()
    {
        Id = log.Id,
        HeadId = log.HeadId,
        HeadSummary = log.HeadSummary,
        Action = log.Action,
        Description = log.Description,
        Status = log.Status.ToString(),
        MechanicId = log.MechanicId,
        MechanicDisplayName = log.MechanicDisplayName,
        ChangedByUserId = log.ChangedByUserId,
        ChangedByDisplayName = log.ChangedByDisplayName,
        Price = log.Price,
        Timestamp = log.Timestamp,
    };

    public async Task<List<HistoryEntryDTO>> GetAllAsync()
    {
        var logs = await _dbContext.Logs
            .OrderByDescending(l => l.Timestamp)
            .ToListAsync();

        return logs.Select(MapToDTO).ToList();
    }

    public async Task<List<HistoryEntryDTO>> GetByHeadAsync(int headId)
    {
        var logs = await _dbContext.Logs
            .Where(l => l.HeadId == headId)
            .OrderByDescending(l => l.Timestamp)
            .ToListAsync();

        return logs.Select(MapToDTO).ToList();
    }

    public async Task<List<HistoryEntryDTO>> GetByMechanicAsync(string mechanicId)
    {
        var logs = await _dbContext.Logs
            .Where(l => l.MechanicId == mechanicId)
            .OrderByDescending(l => l.Timestamp)
            .ToListAsync();

        return logs.Select(MapToDTO).ToList();
    }
}
