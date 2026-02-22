namespace AndreiSoftAPI.Data.Models;

public class Head
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public HeadStatus Status { get; set; } = HeadStatus.Received;
    public decimal Price { get; set; }
    public string Actions { get; set; } //spliited by ;
    public string? AssignedWorkerId { get; set; }
    public ApplicationUser? AssignedWorker { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    public List<HeadStatusLog> StatusLogs { get; set; } = new();
}
