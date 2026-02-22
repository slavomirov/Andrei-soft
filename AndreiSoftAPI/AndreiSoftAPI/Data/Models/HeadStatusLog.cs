namespace AndreiSoftAPI.Data.Models;

public class HeadStatusLog
{
    public int Id { get; set; }

    public int HeadId { get; set; }
    public Head Head { get; set; }
    
    public string HeadDescription { get; set; }
    public HeadStatus Status { get; set; }
    public string? AssignedWorkerId { get; set; }
    public string? AssignedWorkerName { get; set; }

    public string? ChangedByUserId { get; set; }
    public ApplicationUser? ChangedByUser { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.Now;
}
