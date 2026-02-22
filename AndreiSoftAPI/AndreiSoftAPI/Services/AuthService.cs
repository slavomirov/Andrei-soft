using AndreiSoftAPI.Data;
using AndreiSoftAPI.Data.DTOs;
using AndreiSoftAPI.Data.Models;
using AndreiSoftAPI.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace AndreiSoftAPI.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _config;
    private readonly AppDbContext _db;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        IConfiguration config,
        AppDbContext db)
    {
        _userManager = userManager;
        _config = config;
        _db = db;
    }

    public async Task<AuthResponseDTO?> LoginAsync(string username, string password)
    {
        var user = await _userManager.FindByNameAsync(username);
        if (user == null || !user.IsActive) return null;

        if (!await _userManager.CheckPasswordAsync(user, password))
            return null;

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "";

        var accessToken = GenerateJwtToken(user, role);
        var refreshToken = await GenerateRefreshToken(user);

        return new AuthResponseDTO
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            UserId = user.Id,
            UserName = user.UserName ?? "",
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = role,
        };
    }

    public async Task<AuthResponseDTO?> RefreshAsync(string refreshToken)
    {
        var token = await _db.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == refreshToken && !r.IsRevoked);

        if (token == null || token.ExpiresAt < DateTime.UtcNow) return null;

        token.IsRevoked = true;

        var user = token.User;
        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "";

        var newAccess = GenerateJwtToken(user, role);
        var newRefresh = await GenerateRefreshToken(user);

        await _db.SaveChangesAsync();

        return new AuthResponseDTO
        {
            AccessToken = newAccess,
            RefreshToken = newRefresh,
            UserId = user.Id,
            UserName = user.UserName ?? "",
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = role,
        };
    }

    public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordDTO dto)
    {
        if (dto.NewPassword != dto.ConfirmNewPassword) return false;

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        return result.Succeeded;
    }

    private string GenerateJwtToken(ApplicationUser user, string role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.UserName ?? ""),
            new("firstName", user.FirstName),
            new("lastName", user.LastName),
            new(ClaimTypes.Role, role),
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(double.Parse(_config["Jwt:ExpiresInMinutes"] ?? "120")),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<string> GenerateRefreshToken(ApplicationUser user)
    {
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        var refresh = new RefreshToken
        {
            Token = token,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(14),
            IsRevoked = false
        };

        _db.RefreshTokens.Add(refresh);
        await _db.SaveChangesAsync();

        return token;
    }
}