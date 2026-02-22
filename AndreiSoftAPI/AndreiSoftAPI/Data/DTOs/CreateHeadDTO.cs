using System.ComponentModel.DataAnnotations;

namespace AndreiSoftAPI.Data.DTOs;

public class CreateHeadDTO
{
    [Required] public string Make { get; set; } = string.Empty;
    [Required] public string Model { get; set; } = string.Empty;
    [Required] public int Year { get; set; }
    [Required] public string PartNumber { get; set; } = string.Empty;
    [Required] public string OwnerFirstName { get; set; } = string.Empty;
    [Required] public string OwnerLastName { get; set; } = string.Empty;
    [Required] public string ServiceName { get; set; } = string.Empty;
    [Required] public string ServicePhoneNumber { get; set; } = string.Empty;

    /// <summary>List of ServiceNeedType enum names selected by admin</summary>
    public List<int> ServiceNeeds { get; set; } = new();
}
