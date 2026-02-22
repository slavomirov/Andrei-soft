using AndreiSoftAPI.Data.Models;

namespace AndreiSoftAPI.Services.Interfaces;

public interface IStatusLoggerService
{
    Task LogStatusChange(int headId, Head input, string userId);
}
