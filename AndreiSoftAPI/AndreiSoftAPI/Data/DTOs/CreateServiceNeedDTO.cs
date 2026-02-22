using System.ComponentModel.DataAnnotations;

namespace AndreiSoftAPI.Data.DTOs;

public class CreateServiceNeedDTO
{
    [Required] public string Name { get; set; } = string.Empty;
    [Range(0, double.MaxValue)] public decimal Price { get; set; }
}
