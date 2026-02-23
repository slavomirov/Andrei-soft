namespace AndreiSoftAPI.Data.DTOs;

public class UpdateServiceNeedDTO
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
}
