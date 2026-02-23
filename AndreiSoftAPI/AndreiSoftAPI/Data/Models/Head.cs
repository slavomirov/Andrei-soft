namespace AndreiSoftAPI.Data.Models;

public class Head
{
    public int Id { get; set; }

    // Vehicle / part info
    public string? Make { get; set; }
    public string? Model { get; set; }
    public int? Year { get; set; }
    public string? PartNumber { get; set; }

    // Owner info
    public string? OwnerFirstName { get; set; }
    public string? OwnerLastName { get; set; }

    // Service contact
    public string? ServiceName { get; set; }
    public string? ServicePhoneNumber { get; set; }

    // Status & workflow
    public HeadStatus Status { get; set; } = HeadStatus.Added;
    public DateTime CreateDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedDate { get; set; }

    // Mechanic assignment
    public string? MechanicId { get; set; }
    public ApplicationUser? Mechanic { get; set; }
    public string? MechanicDisplayName { get; set; }

    // Service needs (CSV of ServiceNeedType enum names)
    public string? ServiceNeeds { get; set; }

    // Checked / completed service needs by mechanic (CSV)
    public string? CheckedServiceNeeds { get; set; }

    // Price – auto-calculated from service needs
    public decimal Price { get; set; }

    // Audit logs
    public List<HeadStatusLog> StatusLogs { get; set; } = new();
}
