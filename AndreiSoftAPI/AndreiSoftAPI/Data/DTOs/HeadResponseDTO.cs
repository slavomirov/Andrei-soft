namespace AndreiSoftAPI.Data.DTOs;

public class HeadResponseDTO
{
    public int Id { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string PartNumber { get; set; } = string.Empty;
    public string OwnerFirstName { get; set; } = string.Empty;
    public string OwnerLastName { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public string ServicePhoneNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreateDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public string? MechanicId { get; set; }
    public string? MechanicDisplayName { get; set; }
    public List<ServiceNeedResponseDTO> ServiceNeeds { get; set; } = new();
    public List<int> CheckedServiceNeeds { get; set; } = new();
    public decimal Price { get; set; }
    public decimal MechanicSalary { get; set; }
    public decimal Insurance { get; set; }
}
