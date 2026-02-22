using AndreiSoftAPI.Data;
using AndreiSoftAPI.Data.Models;

namespace AndreiSoftAPI.Services;

public class StatusLoggerService : IStatusLoggerService
{
    private readonly AppDbContext _dbContext;

    public StatusLoggerService(AppDbContext db)
    {
        _dbContext = db;
    }

    public async Task LogStatusChange(int headId, Head input, string userId) 
    {
        var log = new HeadStatusLog 
        { 
            HeadId = headId, 
            ChangedByUserId = userId,
            AssignedWorkerId = input.AssignedWorkerId,
            AssignedWorkerName = input.AssignedWorker?.UserName,
            HeadDescription = input.Description,
            Status = input.Status,
        }; 
        
        _dbContext.Logs.Add(log); 
        await _dbContext.SaveChangesAsync(); 
    }
}
