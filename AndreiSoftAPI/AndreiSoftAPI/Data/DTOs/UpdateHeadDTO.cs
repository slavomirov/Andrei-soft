using AndreiSoftAPI.Data.Models;

namespace AndreiSoftAPI.Data.DTOs;

public class UpdateHeadDTO
{
    public string Description { get; set; }
    public string Actions { get; set; }
    public decimal Price { get; set; }
    public HeadStatus Status { get; set; }
    public string? AssignedWorkerId { get; set; }
}
