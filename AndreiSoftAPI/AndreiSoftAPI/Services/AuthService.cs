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
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _config;
    private readonly AppDbContext _db;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration config,
        AppDbContext db)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _config = config;
        _db = db;
    }

    public async Task<(string accessToken, string refreshToken)?> LoginAsync(string username, string password)
    {
        var user = await _userManager.FindByNameAsync(username);
        if (user == null) return null;

        if (!await _userManager.CheckPasswordAsync(user, password))
            return null;

        var accessToken = GenerateJwtToken(user);
        var refreshToken = await GenerateRefreshToken(user);

        return (accessToken, refreshToken);
    }

    public async Task<IdentityResult> RegisterMechanicAsync(RegisterDTO input)
    {
        if (input.Password != input.ConfirmPassword)
            throw new Exception("Passwords do not match.");

        var user = new ApplicationUser
        {
            UserName = input.Username,
            Email = $"{input.Username}@andreisoft.local"
        };

        var result = await _userManager.CreateAsync(user, input.Password);
        if (!result.Succeeded)
            return result;

        await _userManager.AddToRoleAsync(user, "Mechanic");
        return result;
    }

    private string GenerateJwtToken(ApplicationUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.UserName)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(30),
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

    public async Task<(string accessToken, string refreshToken)?> RefreshAsync(string refreshToken)
    {
        var token = await _db.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == refreshToken && !r.IsRevoked);

        if (token == null || token.ExpiresAt < DateTime.UtcNow)
            return null;

        token.IsRevoked = true;

        var newAccess = GenerateJwtToken(token.User);
        var newRefresh = await GenerateRefreshToken(token.User);

        await _db.SaveChangesAsync();

        return (newAccess, newRefresh);
    }
}