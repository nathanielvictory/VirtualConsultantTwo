namespace api.Models;

public class Project
{
    public int Id { get; set; }

    public string Kbid { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? LastRefreshed { get; set; }

    public string Name { get; set; } = string.Empty;
    public string OrganizationId { get; set; } = string.Empty;
    public Organization Organization { get; set; } = null!;
    
    public bool IsActive { get; set; }
    
    public string? ProjectContext { get; set; }

    // Navigations
    public List<Insight> Insights { get; set; } = new();
    public List<Memo> Memos { get; set; } = new();
    public List<Slidedeck> Slidedecks { get; set; } = new();
    public List<TaskJob> Tasks { get; set; } = new();
}