using AndreiSoftAPI.Data.DTOs;

namespace AndreiSoftAPI.Services.Interfaces;

public interface IHeadsService
{
    Task<List<HeadResponseDTO>> GetAllAsync();
    Task<List<HeadResponseDTO>> GetAvailableAsync();
    Task<List<HeadResponseDTO>> GetByMechanicAsync(string mechanicId);
    Task<HeadResponseDTO?> GetByIdAsync(int id);
    Task<HeadResponseDTO> CreateAsync(CreateHeadDTO dto, string userId, string userDisplayName);
    Task<HeadResponseDTO> UpdateAsync(int id, UpdateHeadDTO dto, string userId, string userDisplayName);
    Task DeleteAsync(int id, string userId, string userDisplayName);
    Task<HeadResponseDTO> StartWorkAsync(int headId, string mechanicId, string mechanicDisplayName);
    Task<HeadResponseDTO> FinishAsync(int headId, string mechanicId, string mechanicDisplayName);
    Task<HeadResponseDTO> GiveToClientAsync(int headId, string userId, string userDisplayName);
    Task<HeadResponseDTO> AddServiceNeedAsync(int headId, int serviceNeedId, string userId, string userDisplayName);
    Task<HeadResponseDTO> RemoveServiceNeedAsync(int headId, int serviceNeedId, string userId, string userDisplayName);
    Task<HeadResponseDTO> CheckServiceNeedAsync(int headId, int serviceNeedId, string userId, string userDisplayName);
    Task<List<HeadResponseDTO>> GetReportAsync(string period, string? mechanicId = null);
}