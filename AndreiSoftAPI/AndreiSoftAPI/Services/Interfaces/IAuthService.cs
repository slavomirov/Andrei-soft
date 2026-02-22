using AndreiSoftAPI.Data.DTOs;

namespace AndreiSoftAPI.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDTO?> LoginAsync(string username, string password);
    Task<AuthResponseDTO?> RefreshAsync(string refreshToken);
    Task<bool> ChangePasswordAsync(string userId, ChangePasswordDTO dto);
}
