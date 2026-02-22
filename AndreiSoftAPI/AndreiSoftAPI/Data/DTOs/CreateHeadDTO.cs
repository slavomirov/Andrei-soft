using AndreiSoftAPI.Data.Models;

namespace AndreiSoftAPI.Data.DTOs;

public class CreateHeadDTO
{
    public string Description { get; set; }
    public string Actions { get; set; }
    public decimal Price { get; set; }
    public string? AssignedWorkerId { get; set; }
}
