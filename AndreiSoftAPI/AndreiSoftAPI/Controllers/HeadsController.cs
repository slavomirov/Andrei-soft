using AndreiSoftAPI.Config;
using AndreiSoftAPI.Data.DTOs;
using AndreiSoftAPI.Data.Models;
using AndreiSoftAPI.Hubs;
using AndreiSoftAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace AndreiSoftAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HeadsController : ControllerBase
{
    private readonly IHeadsService _service;
    private readonly IHubContext<HeadsHub> _hub;

    public HeadsController(IHeadsService service, IHubContext<HeadsHub> hub)
    {
        _service = service;
        _hub = hub;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    private string GetDisplayName()
    {
        var first = User.FindFirstValue("firstName") ?? "";
        var last = User.FindFirstValue("lastName") ?? "";
        return $"{first} {last}".Trim();
    }

    // ── Admin endpoints ──────────────────────────────────────────

    [HttpGet]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var head = await _service.GetByIdAsync(id);
        if (head == null) return NotFound();
        return Ok(head);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> Create([FromBody] CreateHeadDTO dto)
    {
        var head = await _service.CreateAsync(dto, GetUserId(), GetDisplayName());
        await _hub.Clients.All.SendAsync("HeadCreated", head);
        return Ok(head);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateHeadDTO dto)
    {
        var head = await _service.UpdateAsync(id, dto, GetUserId(), GetDisplayName());
        await _hub.Clients.All.SendAsync("HeadUpdated", head);
        return Ok(head);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id, GetUserId(), GetDisplayName());
        await _hub.Clients.All.SendAsync("HeadDeleted", id);
        return Ok();
    }

    // ── Mechanic endpoints ───────────────────────────────────────

    [HttpGet("available")]
    [Authorize(Roles = "Mechanic")]
    public async Task<IActionResult> GetAvailable()
    {
        return Ok(await _service.GetAvailableAsync());
    }

    [HttpPost("{id}/start")]
    [Authorize(Roles = "Mechanic")]
    public async Task<IActionResult> Start(int id)
    {
        var userId = GetUserId();
        var displayName = GetDisplayName();

        var head = await _service.StartWorkAsync(id, userId, displayName);

        await _hub.Clients.All.SendAsync("HeadUpdated", head);
        await _hub.Clients.All.SendAsync("HeadAssignedToMechanic", head);
        return Ok(head);
    }

    [HttpPost("{id}/finish")]
    [Authorize(Roles = "Mechanic")]
    public async Task<IActionResult> Finish(int id)
    {
        var userId = GetUserId();
        var displayName = GetDisplayName();
        var head = await _service.FinishAsync(id, userId, displayName);

        await _hub.Clients.All.SendAsync("HeadUpdated", head);
        await _hub.Clients.All.SendAsync("HeadStatusChanged", head);
        return Ok(head);
    }

    [HttpPost("{id}/add-service-need")]
    [Authorize(Roles = "Mechanic,Administrator")]
    public async Task<IActionResult> AddServiceNeed(int id, [FromBody] ServiceNeedDTO dto)
    {
        var head = await _service.AddServiceNeedAsync(id, dto.ServiceNeed, GetUserId(), GetDisplayName());
        await _hub.Clients.All.SendAsync("HeadUpdated", head);
        return Ok(head);
    }

    [HttpPost("{id}/remove-service-need")]
    [Authorize(Roles = "Mechanic,Administrator")]
    public async Task<IActionResult> RemoveServiceNeed(int id, [FromBody] ServiceNeedDTO dto)
    {
        var head = await _service.RemoveServiceNeedAsync(id, dto.ServiceNeed, GetUserId(), GetDisplayName());
        await _hub.Clients.All.SendAsync("HeadUpdated", head);
        return Ok(head);
    }

    [HttpPost("{id}/check-service-need")]
    [Authorize(Roles = "Mechanic")]
    public async Task<IActionResult> CheckServiceNeed(int id, [FromBody] ServiceNeedDTO dto)
    {
        var head = await _service.CheckServiceNeedAsync(id, dto.ServiceNeed, GetUserId(), GetDisplayName());
        await _hub.Clients.All.SendAsync("HeadUpdated", head);
        return Ok(head);
    }

    // ── Service needs catalogue ──────────────────────────────────

    [HttpGet("service-needs")]
    public IActionResult GetServiceNeeds()
    {
        var needs = ServiceNeedsConfig.Prices.Select(kv => new
        {
            Name = kv.Key.ToString(),
            DisplayName = ServiceNeedsConfig.DisplayNames[kv.Key],
            Price = kv.Value,
        });
        return Ok(needs);
    }
}
