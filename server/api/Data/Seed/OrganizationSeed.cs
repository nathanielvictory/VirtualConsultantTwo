using Microsoft.EntityFrameworkCore;

namespace api.Data.Seed;

using api.Models;
    
public static partial class DataSeed
{
    public static async Task<Organization> EnsureOrganizationAsync(AppDbContext db, CancellationToken ct)
    {
        const string defaultOrgId = "recdJu5TiQspX6ihg";
        const string defaultOrgName = "Internal";

        var existing = await db.Organizations
            .FirstOrDefaultAsync(o => o.Id == defaultOrgId, ct);

        if (existing is not null)
            return existing;

        var newOrg = new Organization
        {
            Id = defaultOrgId,
            Name = defaultOrgName
        };

        db.Organizations.Add(newOrg);
        await db.SaveChangesAsync(ct);
        return newOrg;
    }
}