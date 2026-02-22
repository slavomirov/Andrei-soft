using AndreiSoftAPI.Data.DTOs;
using AndreiSoftAPI.Data.Models;
using AndreiSoftAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AndreiSoftAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly UserManager<ApplicationUser> _userManager;

    public AuthController(AuthService authService, UserManager<ApplicationUser> userManager)
    {
        _authService = authService;
        _userManager = userManager;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDTO dto)
    {
        var result = await _authService.LoginAsync(dto.Username, dto.Password);
        if (result == null) return Unauthorized();

        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(RefreshDTO dto)
    {
        var result = await _authService.RefreshAsync(dto.RefreshToken);
        if (result == null) return Unauthorized();

        return Ok(result);
    }


    [Authorize(Roles = "Admin")]
    [HttpPost("register-mechanic")]
    public async Task<IActionResult> RegisterMechanic(RegisterDTO dto)
    {
        var result = await _authService.RegisterMechanicAsync(dto);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok("Mechanic created");
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        // При JWT няма реален logout – клиентът просто изтрива токена
        return Ok("Logged out");
    }
}
