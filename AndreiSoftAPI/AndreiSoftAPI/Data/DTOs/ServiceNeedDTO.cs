using System.ComponentModel.DataAnnotations;

namespace AndreiSoftAPI.Data.DTOs;

public class ServiceNeedDTO
{
    [Required] public int ServiceNeedId { get; set; }
}
