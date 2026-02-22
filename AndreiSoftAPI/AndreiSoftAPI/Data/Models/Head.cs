namespace AndreiSoftAPI.Data.Models;

public class Head
{
    public int Id { get; set; }

    // Vehicle / part info
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string PartNumber { get; set; } = string.Empty;

    // Owner info
    public string OwnerFirstName { get; set; } = string.Empty;
    public string OwnerLastName { get; set; } = string.Empty;

    // Service contact
    public string ServiceName { get; set; } = string.Empty;
    public string ServicePhoneNumber { get; set; } = string.Empty;

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
    public string ServiceNeeds { get; set; } = string.Empty;

    // Checked / completed service needs by mechanic (CSV)
    public string CheckedServiceNeeds { get; set; } = string.Empty;

    // Price – auto-calculated from service needs
    public decimal Price { get; set; }

    // Audit logs
    public List<HeadStatusLog> StatusLogs { get; set; } = new();
}
