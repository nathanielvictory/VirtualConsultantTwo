namespace api.Models;

public class ProjectAccess
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int? ProjectId { get; set; }          // <- nullable
    public Project? Project { get; set; }        // <- nullable

    public bool AllowAccess { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public string? Reason { get; set; }
}
