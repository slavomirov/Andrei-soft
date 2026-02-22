namespace AndreiSoftAPI.Data.DTOs;

public class UpdateHeadDTO
{
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string PartNumber { get; set; } = string.Empty;
    public string OwnerFirstName { get; set; } = string.Empty;
    public string OwnerLastName { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public string ServicePhoneNumber { get; set; } = string.Empty;
    public List<string> ServiceNeeds { get; set; } = new();
    public string? Status { get; set; }
}
