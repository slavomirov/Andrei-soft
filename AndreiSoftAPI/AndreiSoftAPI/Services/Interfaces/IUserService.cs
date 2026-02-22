namespace AndreiSoftAPI.Services.Interfaces;

public interface IUserService
{
    Task EnsureRolesExistAsync();
    Task EnsureAdminUserExistsAsync();
}