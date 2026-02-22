using System.ComponentModel.DataAnnotations;

namespace AndreiSoftAPI.Data.DTOs;

public class ChangePasswordDTO
{
    [Required] public string CurrentPassword { get; set; } = string.Empty;
    [Required] public string NewPassword { get; set; } = string.Empty;
    [Required] public string ConfirmNewPassword { get; set; } = string.Empty;
}
