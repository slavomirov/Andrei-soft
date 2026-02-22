using AndreiSoftAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AndreiSoftAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HistoryController : ControllerBase
{
    private readonly IStatusLoggerService _logger;

    public HistoryController(IStatusLoggerService logger)
    {
        _logger = logger;
    }

    // Admin: get all history
    [HttpGet]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _logger.GetAllAsync());
    }

    // Admin: get history for a specific head
    [HttpGet("by-head/{headId}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> GetByHead(int headId)
    {
        return Ok(await _logger.GetByHeadAsync(headId));
    }

    // Admin: get history for a specific mechanic
    [HttpGet("by-mechanic/{mechanicId}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> GetByMechanic(string mechanicId)
    {
        return Ok(await _logger.GetByMechanicAsync(mechanicId));
    }

    // Mechanic: get own work history
    [HttpGet("my-work")]
    [Authorize(Roles = "Mechanic")]
    public async Task<IActionResult> GetMyWork()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        return Ok(await _logger.GetByMechanicAsync(userId));
    }
}
