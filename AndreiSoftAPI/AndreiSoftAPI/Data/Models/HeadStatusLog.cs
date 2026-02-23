namespace AndreiSoftAPI.Data.Models;

public class HeadStatusLog
{
    public int Id { get; set; }

    public int HeadId { get; set; }
    public Head Head { get; set; } = null!;

    public string? HeadSummary { get; set; }
    public string? Action { get; set; }     // e.g. "Created", "Updated", "StartedWork", etc.
    public string? Description { get; set; } // human-readable detail
    public HeadStatus Status { get; set; }
    public string? MechanicId { get; set; }
    public string? MechanicDisplayName { get; set; }

    public string? ChangedByUserId { get; set; }
    public ApplicationUser? ChangedByUser { get; set; }
    public string? ChangedByDisplayName { get; set; }

    public decimal Price { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
