using AndreiSoftAPI.Data.DTOs;
using AndreiSoftAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AndreiSoftAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDTO dto)
    {
        var result = await _authService.LoginAsync(dto.Username, dto.Password);
        if (result == null) return Unauthorized(new { message = "Invalid credentials" });
        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshDTO dto)
    {
        var result = await _authService.RefreshAsync(dto.RefreshToken);
        if (result == null) return Unauthorized();
        return Ok(result);
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var ok = await _authService.ChangePasswordAsync(userId, dto);
        if (!ok) return BadRequest(new { message = "Failed to change password" });
        return Ok(new { message = "Password changed" });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return Ok(new { message = "Logged out" });
    }
}
