namespace AndreiSoftAPI.Data.DTOs;

public class HistoryEntryDTO
{
    public int Id { get; set; }
    public int HeadId { get; set; }
    public string HeadSummary { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? MechanicId { get; set; }
    public string? MechanicDisplayName { get; set; }
    public string? ChangedByUserId { get; set; }
    public string? ChangedByDisplayName { get; set; }
    public decimal Price { get; set; }
    public DateTime Timestamp { get; set; }
}
