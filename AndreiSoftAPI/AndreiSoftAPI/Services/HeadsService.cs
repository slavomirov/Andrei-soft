using AndreiSoftAPI.Config;
using AndreiSoftAPI.Data;
using AndreiSoftAPI.Data.DTOs;
using AndreiSoftAPI.Data.Models;
using AndreiSoftAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AndreiSoftAPI.Services;

public class HeadsService : IHeadsService
{
    private readonly AppDbContext _db;
    private readonly IStatusLoggerService _logger;

    public HeadsService(AppDbContext db, IStatusLoggerService logger)
    {
        _db = db;
        _logger = logger;
    }

    // ── Mapping helper ──────────────────────────────────────────
    private static HeadResponseDTO MapToDTO(Head h)
    {
        var needs = string.IsNullOrWhiteSpace(h.ServiceNeeds)
            ? new List<string>()
            : h.ServiceNeeds.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

        var checkedNeeds = string.IsNullOrWhiteSpace(h.CheckedServiceNeeds)
            ? new List<string>()
            : h.CheckedServiceNeeds.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

        return new HeadResponseDTO
        {
            Id = h.Id,
            Make = h.Make,
            Model = h.Model,
            Year = h.Year,
            PartNumber = h.PartNumber,
            OwnerFirstName = h.OwnerFirstName,
            OwnerLastName = h.OwnerLastName,
            ServiceName = h.ServiceName,
            ServicePhoneNumber = h.ServicePhoneNumber,
            Status = h.Status.ToString(),
            CreateDate = h.CreateDate,
            CompletedDate = h.CompletedDate,
            MechanicId = h.MechanicId,
            MechanicDisplayName = h.MechanicDisplayName,
            ServiceNeeds = needs,
            CheckedServiceNeeds = checkedNeeds,
            Price = h.Price,
            MechanicSalary = ServiceNeedsConfig.CalculateMechanicSalary(h.Price),
            Insurance = ServiceNeedsConfig.CalculateInsurance(h.Price),
        };
    }

    // ── Queries ─────────────────────────────────────────────────
    public async Task<List<HeadResponseDTO>> GetAllAsync()
    {
        var heads = await _db.Heads
            .OrderByDescending(h => h.CreateDate)
            .ToListAsync();

        return heads.Select(MapToDTO).ToList();
    }

    public async Task<List<HeadResponseDTO>> GetAvailableAsync()
    {
        var heads = await _db.Heads
            .Where(h => h.Status == HeadStatus.Added && h.MechanicId == null)
            .OrderByDescending(h => h.CreateDate)
            .ToListAsync();

        return heads.Select(MapToDTO).ToList();
    }

    public async Task<HeadResponseDTO?> GetByIdAsync(int id)
    {
        var head = await _db.Heads.FindAsync(id);
        return head == null ? null : MapToDTO(head);
    }

    // ── Create (Admin) ──────────────────────────────────────────
    public async Task<HeadResponseDTO> CreateAsync(CreateHeadDTO dto, string userId, string userDisplayName)
    {
        var csv = string.Join(",", dto.ServiceNeeds);
        var price = ServiceNeedsConfig.CalculatePrice(csv);

        var head = new Head
        {
            Make = dto.Make,
            Model = dto.Model,
            Year = dto.Year,
            PartNumber = dto.PartNumber,
            OwnerFirstName = dto.OwnerFirstName,
            OwnerLastName = dto.OwnerLastName,
            ServiceName = dto.ServiceName,
            ServicePhoneNumber = dto.ServicePhoneNumber,
            ServiceNeeds = csv,
            Price = price,
            Status = HeadStatus.Added,
            CreateDate = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _db.Heads.Add(head);
        await _db.SaveChangesAsync();

        await _logger.LogAsync(head, "Created",
            $"Head created: {head.Make} {head.Model} ({head.Year}), PN: {head.PartNumber}, Price: ${head.Price}",
            userId, userDisplayName);

        return MapToDTO(head);
    }

    // ── Update (Admin) ──────────────────────────────────────────
    public async Task<HeadResponseDTO> UpdateAsync(int id, UpdateHeadDTO dto, string userId, string userDisplayName)
    {
        var head = await _db.Heads.FindAsync(id)
            ?? throw new Exception("Head not found");

        head.Make = dto.Make;
        head.Model = dto.Model;
        head.Year = dto.Year;
        head.PartNumber = dto.PartNumber;
        head.OwnerFirstName = dto.OwnerFirstName;
        head.OwnerLastName = dto.OwnerLastName;
        head.ServiceName = dto.ServiceName;
        head.ServicePhoneNumber = dto.ServicePhoneNumber;
        head.ServiceNeeds = string.Join(",", dto.ServiceNeeds);
        head.Price = ServiceNeedsConfig.CalculatePrice(head.ServiceNeeds);
        head.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(dto.Status) && Enum.TryParse<HeadStatus>(dto.Status, out var status))
            head.Status = status;

        await _db.SaveChangesAsync();

        await _logger.LogAsync(head, "Updated",
            $"Head updated: {head.Make} {head.Model} ({head.Year}), Status: {head.Status}, Price: ${head.Price}",
            userId, userDisplayName);

        return MapToDTO(head);
    }

    // ── Delete ──────────────────────────────────────────────────
    public async Task DeleteAsync(int id, string userId, string userDisplayName)
    {
        var head = await _db.Heads.FindAsync(id)
            ?? throw new Exception("Head not found");

        var summary = $"{head.Make} {head.Model} ({head.Year})";

        // Remove related logs first (cascade won't fire for soft ref)
        var relatedLogs = await _db.Logs.Where(l => l.HeadId == id).ToListAsync();
        _db.Logs.RemoveRange(relatedLogs);

        _db.Heads.Remove(head);
        await _db.SaveChangesAsync();
    }

    // ── Start Work (Mechanic) ───────────────────────────────────
    public async Task<HeadResponseDTO> StartWorkAsync(int headId, string mechanicId, string mechanicDisplayName)
    {
        var head = await _db.Heads.FindAsync(headId)
            ?? throw new Exception("Head not found");

        if (head.MechanicId != null || head.Status != HeadStatus.Added)
            throw new Exception("Head is already taken or not available");

        head.MechanicId = mechanicId;
        head.MechanicDisplayName = mechanicDisplayName;
        head.Status = HeadStatus.WorkingOn;
        head.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _logger.LogAsync(head, "StartedWork",
            $"Mechanic {mechanicDisplayName} started working on {head.Make} {head.Model} ({head.Year})",
            mechanicId, mechanicDisplayName);

        return MapToDTO(head);
    }

    // ── Finish (Mechanic) ───────────────────────────────────────
    public async Task<HeadResponseDTO> FinishAsync(int headId, string mechanicId, string mechanicDisplayName)
    {
        var head = await _db.Heads.FindAsync(headId)
            ?? throw new Exception("Head not found");

        if (head.MechanicId != mechanicId)
            throw new Exception("You are not assigned to this Head");

        head.Status = HeadStatus.Completed;
        head.CompletedDate = DateTime.UtcNow;
        head.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _logger.LogAsync(head, "Finished",
            $"Mechanic {mechanicDisplayName} finished work on {head.Make} {head.Model} ({head.Year})",
            mechanicId, mechanicDisplayName);

        return MapToDTO(head);
    }

    // ── Add Service Need ────────────────────────────────────────
    public async Task<HeadResponseDTO> AddServiceNeedAsync(int headId, string serviceNeed, string userId, string userDisplayName)
    {
        var head = await _db.Heads.FindAsync(headId)
            ?? throw new Exception("Head not found");

        var needs = string.IsNullOrWhiteSpace(head.ServiceNeeds)
            ? new List<string>()
            : head.ServiceNeeds.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

        if (!needs.Contains(serviceNeed))
        {
            needs.Add(serviceNeed);
            head.ServiceNeeds = string.Join(",", needs);
            head.Price = ServiceNeedsConfig.CalculatePrice(head.ServiceNeeds);
            head.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            await _logger.LogAsync(head, "ServiceNeedAdded",
                $"Service need '{serviceNeed}' added to {head.Make} {head.Model} ({head.Year}). New price: ${head.Price}",
                userId, userDisplayName);
        }

        return MapToDTO(head);
    }

    // ── Remove Service Need ─────────────────────────────────────
    public async Task<HeadResponseDTO> RemoveServiceNeedAsync(int headId, string serviceNeed, string userId, string userDisplayName)
    {
        var head = await _db.Heads.FindAsync(headId)
            ?? throw new Exception("Head not found");

        var needs = string.IsNullOrWhiteSpace(head.ServiceNeeds)
            ? new List<string>()
            : head.ServiceNeeds.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

        if (needs.Remove(serviceNeed))
        {
            head.ServiceNeeds = string.Join(",", needs);
            head.Price = ServiceNeedsConfig.CalculatePrice(head.ServiceNeeds);

            // also remove from checked if present
            var checkedNeeds = string.IsNullOrWhiteSpace(head.CheckedServiceNeeds)
                ? new List<string>()
                : head.CheckedServiceNeeds.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
            checkedNeeds.Remove(serviceNeed);
            head.CheckedServiceNeeds = string.Join(",", checkedNeeds);

            head.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            await _logger.LogAsync(head, "ServiceNeedRemoved",
                $"Service need '{serviceNeed}' removed from {head.Make} {head.Model} ({head.Year}). New price: ${head.Price}",
                userId, userDisplayName);
        }

        return MapToDTO(head);
    }

    // ── Check Service Need (mark completed) ─────────────────────
    public async Task<HeadResponseDTO> CheckServiceNeedAsync(int headId, string serviceNeed, string userId, string userDisplayName)
    {
        var head = await _db.Heads.FindAsync(headId)
            ?? throw new Exception("Head not found");

        var checkedNeeds = string.IsNullOrWhiteSpace(head.CheckedServiceNeeds)
            ? new List<string>()
            : head.CheckedServiceNeeds.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

        var wasChecked = checkedNeeds.Contains(serviceNeed);
        if (wasChecked)
            checkedNeeds.Remove(serviceNeed); // toggle off
        else
            checkedNeeds.Add(serviceNeed); // toggle on

        head.CheckedServiceNeeds = string.Join(",", checkedNeeds);
        head.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var toggleAction = wasChecked ? "unchecked" : "checked";
        await _logger.LogAsync(head, "ServiceNeedChecked",
            $"Service need '{serviceNeed}' {toggleAction} on {head.Make} {head.Model} ({head.Year})",
            userId, userDisplayName);

        return MapToDTO(head);
    }
}
