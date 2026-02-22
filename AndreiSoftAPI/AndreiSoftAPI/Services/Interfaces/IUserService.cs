using AndreiSoftAPI.Data.DTOs;

namespace AndreiSoftAPI.Services.Interfaces;

public interface IUserService
{
    Task EnsureRolesExistAsync();
    Task EnsureAdminUserExistsAsync();
    Task<List<UserResponseDTO>> GetAllUsersAsync();
    Task<UserResponseDTO?> GetUserByIdAsync(string id);
    Task<UserResponseDTO> CreateUserAsync(RegisterDTO dto);
    Task<UserResponseDTO> UpdateUserAsync(string id, UpdateUserDTO dto);
    Task DeactivateUserAsync(string id);
}