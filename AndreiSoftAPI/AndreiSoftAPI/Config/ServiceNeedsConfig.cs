using AndreiSoftAPI.Data.Models;

namespace AndreiSoftAPI.Config;

public static class ServiceNeedsConfig
{
    public static readonly Dictionary<ServiceNeedType, decimal> Prices = new()
    {
        { ServiceNeedType.ValveSeatMachining,       150m },
        { ServiceNeedType.ValveGuidesReplacement,   200m },
        { ServiceNeedType.SurfaceGrinding,          120m },
        { ServiceNeedType.CrackTesting,              80m },
        { ServiceNeedType.CleaningAndWashing,         60m },
        { ServiceNeedType.SpringTesting,              50m },
        { ServiceNeedType.SealReplacement,            90m },
        { ServiceNeedType.PortingAndPolishing,       300m },
        { ServiceNeedType.AssemblyWork,              180m },
        { ServiceNeedType.PressureTesting,           100m },
    };

    public static readonly Dictionary<ServiceNeedType, string> DisplayNames = new()
    {
        { ServiceNeedType.ValveSeatMachining,       "Valve Seat Machining" },
        { ServiceNeedType.ValveGuidesReplacement,   "Valve Guides Replacement" },
        { ServiceNeedType.SurfaceGrinding,          "Surface Grinding" },
        { ServiceNeedType.CrackTesting,             "Crack Testing" },
        { ServiceNeedType.CleaningAndWashing,       "Cleaning & Washing" },
        { ServiceNeedType.SpringTesting,            "Spring Testing" },
        { ServiceNeedType.SealReplacement,          "Seal Replacement" },
        { ServiceNeedType.PortingAndPolishing,      "Porting & Polishing" },
        { ServiceNeedType.AssemblyWork,             "Assembly Work" },
        { ServiceNeedType.PressureTesting,          "Pressure Testing" },
    };

    /// <summary>
    /// Calculate total price from a CSV string of ServiceNeedType names.
    /// </summary>
    public static decimal CalculatePrice(string serviceNeedsCsv)
    {
        if (string.IsNullOrWhiteSpace(serviceNeedsCsv)) return 0;

        return serviceNeedsCsv
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(s => Enum.TryParse<ServiceNeedType>(s, out _))
            .Select(s => Enum.Parse<ServiceNeedType>(s))
            .Where(sn => Prices.ContainsKey(sn))
            .Sum(sn => Prices[sn]);
    }

    /// <summary>
    /// Mechanic salary = 25% of price
    /// </summary>
    public static decimal CalculateMechanicSalary(decimal price) => Math.Round(price * 0.25m, 2);

    /// <summary>
    /// Insurance = 5% of price
    /// </summary>
    public static decimal CalculateInsurance(decimal price) => Math.Round(price * 0.05m, 2);
}
