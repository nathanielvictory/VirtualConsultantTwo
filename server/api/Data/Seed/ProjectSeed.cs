using Microsoft.EntityFrameworkCore;

namespace api.Data.Seed;

using api.Models;
    
public static partial class DataSeed
{
    public static async Task<Project> EnsureProjectAsync(AppDbContext db, Organization org, CancellationToken ct)
    {
        const string defaultKbid = "reczmSWIH1WnOJ7VH";
        const string defaultName = "TN Statewide Nuclear 2025-07-09";

        var existing = await db.Projects
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Kbid == defaultKbid, ct);

        if (existing is not null)
            return existing;

        var newProject = new Project
        {
            Kbid = defaultKbid,
            Name = defaultName,
            OrganizationId = org.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Projects.Add(newProject);
        await db.SaveChangesAsync(ct);
        return newProject;
    }
}