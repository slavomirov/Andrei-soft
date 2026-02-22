using Microsoft.AspNetCore.Identity;


namespace AndreiSoftAPI.Data.Models;

public class ApplicationUser : IdentityUser
{

    public List<Head> Heads { get; set; }
}
    