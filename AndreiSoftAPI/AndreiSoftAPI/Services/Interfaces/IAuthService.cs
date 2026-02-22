using AndreiSoftAPI.Data.DTOs;
using Microsoft.AspNetCore.Identity;

namespace AndreiSoftAPI.Services.Interfaces;

public interface IAuthService
{
    Task<(string accessToken, string refreshToken)?> LoginAsync(string username, string password);
    Task<IdentityResult> RegisterMechanicAsync(RegisterDTO input);
    Task<(string accessToken, string refreshToken)?> RefreshAsync(string refreshToken);
}
