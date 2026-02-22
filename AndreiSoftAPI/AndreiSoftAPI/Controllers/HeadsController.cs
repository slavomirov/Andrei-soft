using AndreiSoftAPI.Data.DTOs;
using AndreiSoftAPI.Data.Models;
using AndreiSoftAPI.Hubs;
using AndreiSoftAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.CodeAnalysis.Elfie.Serialization;
using System.Security.Claims;

namespace AndreiSoftAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HeadsController : ControllerBase
{
    private readonly HeadsService _service;
    private readonly IHubContext<HeadsHub> _hub;

    public HeadsController(HeadsService service, IHubContext<HeadsHub> hub)
    {
        _service = service;
        _hub = hub;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var heads = await _service.GetAllAsync();
        return Ok(heads);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var head = await _service.GetByIdAsync(id);
        return Ok(head);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateHeadDTO dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var head = await _service.CreateAsync(dto, userId);
        await _hub.Clients.All.SendAsync("HeadAdded", head);

        return Ok(head);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateHeadDTO dto)
    {
        var head = await _service.UpdateAsync(id, dto);
        await _hub.Clients.All.SendAsync("HeadUpdated", head);
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        await _hub.Clients.All.SendAsync("HeadDeleted", id);
        return Ok();
    }

    [HttpPost("{headId}/assign")]
    public async Task<IActionResult> Assign(int headId, string workerId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var head = await _service.AssignAsync(headId, workerId, userId);

        await _hub.Clients.All.SendAsync("HeadUpdated", head);
        return Ok(head);
    }

    [HttpPost("{id}/status")]
    public async Task<IActionResult> ChangeStatus(int id, HeadStatus newStatus)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var head = await _service.ChangeStatusAsync(id, newStatus, userId);

        await _hub.Clients.All.SendAsync("HeadUpdated", head);
        return Ok(head);
    }
}
