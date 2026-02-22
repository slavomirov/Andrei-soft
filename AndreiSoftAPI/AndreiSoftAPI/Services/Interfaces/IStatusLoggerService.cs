using AndreiSoftAPI.Data.DTOs;
using AndreiSoftAPI.Data.Models;

namespace AndreiSoftAPI.Services.Interfaces;

public interface IStatusLoggerService
{
    Task LogAsync(Head head, string action, string description, string? userId, string? userDisplayName);

    // Queries
    Task<List<HistoryEntryDTO>> GetAllAsync();
    Task<List<HistoryEntryDTO>> GetByHeadAsync(int headId);
    Task<List<HistoryEntryDTO>> GetByMechanicAsync(string mechanicId);
}
