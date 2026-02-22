using System.ComponentModel.DataAnnotations;

namespace AndreiSoftAPI.Data.DTOs;

public class UpdateServiceNeedDTO
{
    [Required] public string Name { get; set; } = string.Empty;
    [Range(0, double.MaxValue)] public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
}
