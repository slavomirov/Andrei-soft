using Microsoft.AspNetCore.Identity;

namespace AndreiSoftAPI.Data.Models;

public class ApplicationUser : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public bool IsActive { get; set; } = true;

    public List<Head> Heads { get; set; } = new();
}
    