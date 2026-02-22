namespace AndreiSoftAPI.Data.Models;

public enum HeadStatus
{
    Added,
    WorkingOn,
    Completed,
    GivenToClient
}

public enum HeadAction
{
    Created,
    Assigned,
    Started,
    Finished,
    GivenToClient
}

public enum ServiceNeedType
{
    ValveSeatMachining,
    ValveGuidesReplacement,
    SurfaceGrinding,
    CrackTesting,
    CleaningAndWashing,
    SpringTesting,
    SealReplacement,
    PortingAndPolishing,
    AssemblyWork,
    PressureTesting
}
