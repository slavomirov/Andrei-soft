using AndreiSoftAPI.Data.DTOs;
using AndreiSoftAPI.Data.Models;
using AndreiSoftAPI.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AndreiSoftAPI.Services;

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public UserService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task EnsureRolesExistAsync()
    {
        var roles = new[] { "Administrator", "Mechanic" };
        foreach (var role in roles)
        {
            if (!await _roleManager.RoleExistsAsync(role))
                await _roleManager.CreateAsync(new IdentityRole(role));
        }
    }

    public async Task EnsureAdminUserExistsAsync()
    {
        var admin = await _userManager.FindByNameAsync("admin");
        if (admin == null)
        {
            admin = new ApplicationUser
            {
                UserName = "admin",
                Email = "admin@andreisoft.local",
                FirstName = "Admin",
                LastName = "User",
                IsActive = true,
            };
            await _userManager.CreateAsync(admin, "Admin123!");
            await _userManager.AddToRoleAsync(admin, "Administrator");
        }
    }

    public async Task<List<UserResponseDTO>> GetAllUsersAsync()
    {
        var users = await _userManager.Users.ToListAsync();
        var result = new List<UserResponseDTO>();

        foreach (var u in users)
        {
            var roles = await _userManager.GetRolesAsync(u);
            result.Add(new UserResponseDTO
            {
                Id = u.Id,
                UserName = u.UserName ?? "",
                FirstName = u.FirstName,
                LastName = u.LastName,
                Role = roles.FirstOrDefault() ?? "",
                IsActive = u.IsActive,
            });
        }

        return result;
    }

    public async Task<UserResponseDTO?> GetUserByIdAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return null;

        var roles = await _userManager.GetRolesAsync(user);
        return new UserResponseDTO
        {
            Id = user.Id,
            UserName = user.UserName ?? "",
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = roles.FirstOrDefault() ?? "",
            IsActive = user.IsActive,
        };
    }

    public async Task<UserResponseDTO> CreateUserAsync(RegisterDTO dto)
    {
        if (dto.Password != dto.ConfirmPassword)
            throw new Exception("Passwords do not match.");

        var user = new ApplicationUser
        {
            UserName = dto.Username,
            Email = $"{dto.Username}@andreisoft.local",
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            IsActive = true,
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            throw new Exception(string.Join("; ", result.Errors.Select(e => e.Description)));

        var role = string.IsNullOrWhiteSpace(dto.Role) ? "Mechanic" : dto.Role;
        await _userManager.AddToRoleAsync(user, role);

        return new UserResponseDTO
        {
            Id = user.Id,
            UserName = user.UserName ?? "",
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = role,
            IsActive = true,
        };
    }

    public async Task<UserResponseDTO> UpdateUserAsync(string id, UpdateUserDTO dto)
    {
        var user = await _userManager.FindByIdAsync(id)
            ?? throw new Exception("User not found");

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.IsActive = dto.IsActive;
        await _userManager.UpdateAsync(user);

        // Update role
        var currentRoles = await _userManager.GetRolesAsync(user);
        if (currentRoles.Any())
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
        if (!string.IsNullOrWhiteSpace(dto.Role))
            await _userManager.AddToRoleAsync(user, dto.Role);

        return new UserResponseDTO
        {
            Id = user.Id,
            UserName = user.UserName ?? "",
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = dto.Role,
            IsActive = user.IsActive,
        };
    }

    public async Task DeactivateUserAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id)
            ?? throw new Exception("User not found");
        user.IsActive = false;
        await _userManager.UpdateAsync(user);
    }
}
