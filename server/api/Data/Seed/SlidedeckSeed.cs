using Microsoft.EntityFrameworkCore;

namespace api.Data.Seed;

using api.Models;

public static partial class DataSeed
{
    public static async Task<Slidedeck> EnsureSlidedeckAsync(
        AppDbContext db,
        Project project,
        CancellationToken ct)
    {
        const string defaultName = "Nuclear Test Slides";
        const string defaultPresentationId = "1xXayw9SkskXMQ8hO828sxz1BNdttoTcT7eXsOs78ADI";
        const string defaultSheetsId = "1US9PKrFlIZI-44lA7zZtfaWQoCSjVPOrfSCXQlwycXg";
        const int defaultCreatedById = 1; // admin user

        var existing = await db.Slidedecks
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(s =>
                s.ProjectId == project.Id &&
                s.PresentationId == defaultPresentationId, ct);

        if (existing is not null)
            return existing;

        var newDeck = new Slidedeck
        {
            Name = defaultName,
            PresentationId = defaultPresentationId,
            SheetsId = defaultSheetsId,
            ProjectId = project.Id,
            CreatedById = defaultCreatedById,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Slidedecks.Add(newDeck);
        await db.SaveChangesAsync(ct);
        return newDeck;
    }
}