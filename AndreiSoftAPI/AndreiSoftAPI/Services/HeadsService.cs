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

    // ── Helpers ─────────────────────────────────────────────────
    private async Task<Dictionary<int, ServiceNeed>> GetNeedsLookupAsync()
    {
        return await _db.ServiceNeeds.ToDictionaryAsync(sn => sn.Id);
    }

    private static List<int> ParseIds(string? csv)
    {
        if (string.IsNullOrWhiteSpace(csv)) return new List<int>();
        return csv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(s => int.TryParse(s, out _))
            .Select(int.Parse)
            .ToList();
    }

    private static decimal CalculatePrice(List<int> needIds, Dictionary<int, ServiceNeed> lookup)
    {
        return needIds
            .Where(id => lookup.ContainsKey(id))
            .Sum(id => lookup[id].Price);
    }

    private static HeadResponseDTO MapToDTO(Head h, Dictionary<int, ServiceNeed> lookup)
    {
        var needIds = ParseIds(h.ServiceNeeds);
        var checkedIds = ParseIds(h.CheckedServiceNeeds);

        var serviceNeeds = needIds
            .Where(id => lookup.ContainsKey(id))
            .Select(id => new ServiceNeedResponseDTO
            {
                Id = lookup[id].Id,
                Name = lookup[id].Name,
                Price = lookup[id].Price,
                IsActive = lookup[id].IsActive,
            })
            .ToList();

        return new HeadResponseDTO
        {
            Id = h.Id,
            Make = h.Make ?? string.Empty,
            Model = h.Model ?? string.Empty,
            Year = h.Year ?? 0,
            PartNumber = h.PartNumber ?? string.Empty,
            OwnerFirstName = h.OwnerFirstName ?? string.Empty,
            OwnerLastName = h.OwnerLastName ?? string.Empty,
            ServiceName = h.ServiceName ?? string.Empty,
            ServicePhoneNumber = h.ServicePhoneNumber ?? string.Empty,
            Status = h.Status.ToString(),
            CreateDate = h.CreateDate,
            CompletedDate = h.CompletedDate,
            MechanicId = h.MechanicId,
            MechanicDisplayName = h.MechanicDisplayName,
            ServiceNeeds = serviceNeeds,
            CheckedServiceNeeds = checkedIds,
            Price = h.Price,
            MechanicSalary = Math.Round(h.Price * 0.25m, 2),
            Insurance = Math.Round(h.Price * 0.05m, 2),
        };
    }

    // ── Queries ─────────────────────────────────────────────────
    public async Task<List<HeadResponseDTO>> GetAllAsync()
    {
        var lookup = await GetNeedsLookupAsync();
        var heads = await _db.Heads
            .OrderByDescending(h => h.CreateDate)
            .ToListAsync();

        return heads.Select(h => MapToDTO(h, lookup)).ToList();
    }

    public async Task<List<HeadResponseDTO>> GetAvailableAsync()
    {
        var lookup = await GetNeedsLookupAsync();
        var heads = await _db.Heads
            .Where(h => h.Status == HeadStatus.Added && h.MechanicId == null)
            .OrderByDescending(h => h.CreateDate)
            .ToListAsync();

        return heads.Select(h => MapToDTO(h, lookup)).ToList();
    }

    public async Task<List<HeadResponseDTO>> GetByMechanicAsync(string mechanicId)
    {
        var lookup = await GetNeedsLookupAsync();
        var heads = await _db.Heads
            .Where(h => h.MechanicId == mechanicId && (h.Status != HeadStatus.GivenToClient))
            .OrderByDescending(h => h.UpdatedAt)
            .ToListAsync();

        return heads.Select(h => MapToDTO(h, lookup)).ToList();
    }

    public async Task<List<HeadResponseDTO>> GetReportAsync(string period, string? mechanicId = null)
    {
        var now = DateTime.UtcNow;
        var from = period switch
        {
            "week" => now.AddDays(-7),
            "month" => now.AddMonths(-1),
            "year" => now.AddYears(-1),
            _ => now.AddDays(-7),
        };

        var query = _db.Heads
            .Where(h => (h.Status == HeadStatus.Completed || h.Status == HeadStatus.GivenToClient)
                && h.CompletedDate != null && h.CompletedDate >= from);

        if (mechanicId != null)
            query = query.Where(h => h.MechanicId == mechanicId);

        var lookup = await GetNeedsLookupAsync();
        var heads = await query.OrderByDescending(h => h.CompletedDate).ToListAsync();

        return heads.Select(h => MapToDTO(h, lookup)).ToList();
    }

    public async Task<HeadResponseDTO?> GetByIdAsync(int id)
    {
        var head = await _db.Heads.FindAsync(id);
        if (head == null) return null;
        var lookup = await GetNeedsLookupAsync();
        return MapToDTO(head, lookup);
    }

    // ── Create (Admin) ──────────────────────────────────────────
    public async Task<HeadResponseDTO> CreateAsync(CreateHeadDTO dto, string userId, string userDisplayName)
    {
        var lookup = await GetNeedsLookupAsync();
        var csv = string.Join(",", dto.ServiceNeeds);
        var price = CalculatePrice(dto.ServiceNeeds, lookup);

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
            $"Head created: {head.Make} {head.Model} ({head.Year}), PN: {head.PartNumber}, Price: {head.Price} \u20AC",
            userId, userDisplayName);

        return MapToDTO(head, lookup);
    }

    // ── Update (Admin) ──────────────────────────────────────────
    public async Task<HeadResponseDTO> UpdateAsync(int id, UpdateHeadDTO dto, string userId, string userDisplayName)
    {
        var head = await _db.Heads.FindAsync(id)
            ?? throw new Exception("Head not found");

        var lookup = await GetNeedsLookupAsync();

        head.Make = dto.Make;
        head.Model = dto.Model;
        head.Year = dto.Year;
        head.PartNumber = dto.PartNumber;
        head.OwnerFirstName = dto.OwnerFirstName;
        head.OwnerLastName = dto.OwnerLastName;
        head.ServiceName = dto.ServiceName;
        head.ServicePhoneNumber = dto.ServicePhoneNumber;
        head.ServiceNeeds = string.Join(",", dto.ServiceNeeds);
        head.Price = CalculatePrice(dto.ServiceNeeds, lookup);
        head.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(dto.Status) && Enum.TryParse<HeadStatus>(dto.Status, out var status))
            head.Status = status;

        // Allow admin to reassign mechanic
        if (dto.MechanicId != null)
        {
            if (dto.MechanicId == "")
            {
                // Unassign mechanic
                head.MechanicId = null;
                head.MechanicDisplayName = null;
            }
            else
            {
                var mechanic = await _db.Users.FindAsync(dto.MechanicId);
                if (mechanic != null)
                {
                    head.MechanicId = mechanic.Id;
                    head.MechanicDisplayName = $"{mechanic.FirstName} {mechanic.LastName}".Trim();
                }
            }
        }

        await _db.SaveChangesAsync();

        await _logger.LogAsync(head, "Updated",
            $"Head updated: {head.Make} {head.Model} ({head.Year}), Status: {head.Status}, Price: {head.Price} \u20AC",
            userId, userDisplayName);

        return MapToDTO(head, lookup);
    }

    // ── Delete ──────────────────────────────────────────────────
    public async Task DeleteAsync(int id, string userId, string userDisplayName)
    {
        var head = await _db.Heads.FindAsync(id)
            ?? throw new Exception("Head not found");

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

        var lookup = await GetNeedsLookupAsync();
        return MapToDTO(head, lookup);
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

        var lookup = await GetNeedsLookupAsync();
        return MapToDTO(head, lookup);
    }

    // ── Give to Client ──────────────────────────────────────────
    public async Task<HeadResponseDTO> GiveToClientAsync(int headId, string userId, string userDisplayName)
    {
        var head = await _db.Heads.FindAsync(headId)
            ?? throw new Exception("Head not found");

        if (head.Status != HeadStatus.Completed)
            throw new Exception("Head must be completed before giving to client");

        head.Status = HeadStatus.GivenToClient;
        head.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _logger.LogAsync(head, "GivenToClient",
            $"Head {head.Make} {head.Model} ({head.Year}) given to client by {userDisplayName}",
            userId, userDisplayName);

        var lookup = await GetNeedsLookupAsync();
        return MapToDTO(head, lookup);
    }

    // ── Add Service Need ────────────────────────────────────────
    public async Task<HeadResponseDTO> AddServiceNeedAsync(int headId, int serviceNeedId, string userId, string userDisplayName)
    {
        var head = await _db.Heads.FindAsync(headId)
            ?? throw new Exception("Head not found");

        var lookup = await GetNeedsLookupAsync();
        if (!lookup.ContainsKey(serviceNeedId))
            throw new Exception("Service need not found");

        var needIds = ParseIds(head.ServiceNeeds);

        if (!needIds.Contains(serviceNeedId))
        {
            needIds.Add(serviceNeedId);
            head.ServiceNeeds = string.Join(",", needIds);
            head.Price = CalculatePrice(needIds, lookup);
            head.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            var needName = lookup[serviceNeedId].Name;
            await _logger.LogAsync(head, "ServiceNeedAdded",
                $"Service need '{needName}' added to {head.Make} {head.Model} ({head.Year}). New price: {head.Price} \u20AC",
                userId, userDisplayName);
        }

        return MapToDTO(head, lookup);
    }

    // ── Remove Service Need ─────────────────────────────────────
    public async Task<HeadResponseDTO> RemoveServiceNeedAsync(int headId, int serviceNeedId, string userId, string userDisplayName)
    {
        var head = await _db.Heads.FindAsync(headId)
            ?? throw new Exception("Head not found");

        var lookup = await GetNeedsLookupAsync();
        var needIds = ParseIds(head.ServiceNeeds);

        if (needIds.Remove(serviceNeedId))
        {
            head.ServiceNeeds = string.Join(",", needIds);
            head.Price = CalculatePrice(needIds, lookup);

            var checkedIds = ParseIds(head.CheckedServiceNeeds);
            checkedIds.Remove(serviceNeedId);
            head.CheckedServiceNeeds = string.Join(",", checkedIds);

            head.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            var needName = lookup.ContainsKey(serviceNeedId) ? lookup[serviceNeedId].Name : serviceNeedId.ToString();
            await _logger.LogAsync(head, "ServiceNeedRemoved",
                $"Service need '{needName}' removed from {head.Make} {head.Model} ({head.Year}). New price: {head.Price} \u20AC",
                userId, userDisplayName);
        }

        return MapToDTO(head, lookup);
    }

    // ── Check Service Need (mark completed) ─────────────────────
    public async Task<HeadResponseDTO> CheckServiceNeedAsync(int headId, int serviceNeedId, string userId, string userDisplayName)
    {
        var head = await _db.Heads.FindAsync(headId)
            ?? throw new Exception("Head not found");

        var checkedIds = ParseIds(head.CheckedServiceNeeds);

        var wasChecked = checkedIds.Contains(serviceNeedId);
        if (wasChecked)
            checkedIds.Remove(serviceNeedId);
        else
            checkedIds.Add(serviceNeedId);

        head.CheckedServiceNeeds = string.Join(",", checkedIds);
        head.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var lookup = await GetNeedsLookupAsync();
        var needName = lookup.ContainsKey(serviceNeedId) ? lookup[serviceNeedId].Name : serviceNeedId.ToString();
        var toggleAction = wasChecked ? "unchecked" : "checked";
        await _logger.LogAsync(head, "ServiceNeedChecked",
            $"Service need '{needName}' {toggleAction} on {head.Make} {head.Model} ({head.Year})",
            userId, userDisplayName);

        return MapToDTO(head, lookup);
    }
}
