// Infrastructure/StartupTasks.cs

using api.Data;
using Microsoft.EntityFrameworkCore;

namespace api.Infrastructure;

public static class StartupTasks
{
    public static async Task MigrateAndSeedAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var sp  = scope.ServiceProvider;

        // 1) Apply EF Core migrations
        var db = sp.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync(); // no-op if already up to date

        // 2) Seed Identity (roles/users)
        var cfg = sp.GetRequiredService<IConfiguration>();
        await IdentitySeed.EnsureAdminAsync(sp, cfg);

        // 3) Seed app/domain data
        await AppDataSeed.SeedAsync(db, sp);
    }
}