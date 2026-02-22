using AndreiSoftAPI.Data.Models;
using AndreiSoftAPI.Services.Interfaces;
using Microsoft.AspNetCore.Identity;

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
        var roles = new[] { "Admin", "Mechanic", "Receiver" };

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
            };

            await _userManager.CreateAsync(admin, "Admin123!");
            await _userManager.AddToRoleAsync(admin, "Admin");
        }
    }
}
