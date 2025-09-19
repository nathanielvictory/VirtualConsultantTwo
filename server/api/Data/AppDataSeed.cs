// Data/AppDataSeed.cs
using Microsoft.EntityFrameworkCore;
using api.Models;
using api.Data.Seed;

namespace api.Data;

public static class AppDataSeed
{
    /// <summary>
    /// Call this after Database.Migrate() and after Identity seeding.
    /// </summary>
    public static async Task SeedAsync(AppDbContext db, IServiceProvider sp, CancellationToken ct = default)
    {

        // 1) Organization
        var org = await DataSeed.EnsureOrganizationAsync(db, ct);

        // 2) Project (depends on Organization)
        var project = await DataSeed.EnsureProjectAsync(db, org, ct);

        // 3) SystemPrompt
        await DataSeed.EnsureSystemPromptAsync(db, ct);

        // 4) Memo (often belongs to Project or Org)
        var memo = await DataSeed.EnsureMemoAsync(db, project, ct);

        // 5) Slidedeck (often belongs to Project or Org)
        var deck = await DataSeed.EnsureSlidedeckAsync(db, project, ct);
    }
}
