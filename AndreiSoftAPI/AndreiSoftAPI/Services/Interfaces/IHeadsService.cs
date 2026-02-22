using AndreiSoftAPI.Data.DTOs;
using AndreiSoftAPI.Data.Models;

namespace AndreiSoftAPI.Services.Interfaces;

public interface IHeadsService
{
    Task<List<Head>> GetAllAsync();
    Task<Head?> GetByIdAsync(int id);
    Task<Head> CreateAsync(CreateHeadDTO dto, string userId);
    Task<Head> UpdateAsync(int id, UpdateHeadDTO input);
    Task DeleteAsync(int id);
    Task<Head?> AssignAsync(int headId, string workerId, string changedByUserId);
    Task<Head?> ChangeStatusAsync(int headId, HeadStatus newStatus, string userId);
}