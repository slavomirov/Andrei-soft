using AndreiSoftAPI.Data;
using AndreiSoftAPI.Data.DTOs;
using AndreiSoftAPI.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AndreiSoftAPI.Controllers;

[ApiController]
[Route("api/service-needs")]
[Authorize]
public class ServiceNeedsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ServiceNeedsController(AppDbContext db)
    {
        _db = db;
    }

    // ── List active (any authenticated user) ─────────────────────
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var needs = await _db.ServiceNeeds
            .Where(sn => sn.IsActive)
            .OrderBy(sn => sn.Name)
            .Select(sn => new ServiceNeedResponseDTO
            {
                Id = sn.Id,
                Name = sn.Name,
                Price = sn.Price,
                IsActive = sn.IsActive,
            })
            .ToListAsync();

        return Ok(needs);
    }

    // ── List all including inactive (admin) ──────────────────────
    [HttpGet("all")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> GetAllIncludingInactive()
    {
        var needs = await _db.ServiceNeeds
            .OrderBy(sn => sn.Name)
            .Select(sn => new ServiceNeedResponseDTO
            {
                Id = sn.Id,
                Name = sn.Name,
                Price = sn.Price,
                IsActive = sn.IsActive,
            })
            .ToListAsync();

        return Ok(needs);
    }

    // ── Create (admin) ───────────────────────────────────────────
    [HttpPost]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> Create([FromBody] CreateServiceNeedDTO dto)
    {
        var entity = new ServiceNeed
        {
            Name = dto.Name,
            Price = dto.Price,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        _db.ServiceNeeds.Add(entity);
        await _db.SaveChangesAsync();

        return Ok(new ServiceNeedResponseDTO
        {
            Id = entity.Id,
            Name = entity.Name,
            Price = entity.Price,
            IsActive = entity.IsActive,
        });
    }

    // ── Update (admin) ───────────────────────────────────────────
    [HttpPut("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceNeedDTO dto)
    {
        var entity = await _db.ServiceNeeds.FindAsync(id);
        if (entity == null) return NotFound();

        entity.Name = dto.Name;
        entity.Price = dto.Price;
        entity.IsActive = dto.IsActive;

        await _db.SaveChangesAsync();

        return Ok(new ServiceNeedResponseDTO
        {
            Id = entity.Id,
            Name = entity.Name,
            Price = entity.Price,
            IsActive = entity.IsActive,
        });
    }

    // ── Soft-delete (admin) ──────────────────────────────────────
    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _db.ServiceNeeds.FindAsync(id);
        if (entity == null) return NotFound();

        entity.IsActive = false;
        await _db.SaveChangesAsync();

        return Ok();
    }
}
