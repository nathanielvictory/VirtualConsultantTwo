using Microsoft.EntityFrameworkCore;

namespace api.Data.Seed;

using api.Models;

public static partial class DataSeed
{
    public static async Task<Memo> EnsureMemoAsync(
        AppDbContext db,
        Project project,
        CancellationToken ct)
    {
        const string defaultName = "Nuclear Test Memo";
        const string defaultDocId = "1R3iFZdvb-EHX8A5ZuHvss_0ZPJal15-uxMz4tOfTDS0";
        const int defaultCreatedById = 1; // admin user

        var existing = await db.Memos
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(m =>
                m.ProjectId == project.Id &&
                m.DocId == defaultDocId, ct);

        if (existing is not null)
            return existing;

        var newMemo = new Memo
        {
            Name = defaultName,
            DocId = defaultDocId,
            ProjectId = project.Id,
            CreatedById = defaultCreatedById,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
            // PromptFocus left null
        };

        db.Memos.Add(newMemo);
        await db.SaveChangesAsync(ct);
        return newMemo;
    }
}