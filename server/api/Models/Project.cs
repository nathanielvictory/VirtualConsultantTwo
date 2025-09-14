namespace api.Models;

public class Project
{
    public int Id { get; set; }

    public string Kbid { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? LastRefreshed { get; set; }

    public string Name { get; set; } = string.Empty;
    public string OrganizationId { get; set; } = string.Empty;
    public Organization Organization { get; set; } = null!;
    
    public bool IsActive { get; set; }

    // New: optional context
    public string? ProjectContext { get; set; }

    // Navigations
    public List<Insight> Insights { get; set; } = new();
    public List<Memo> Memos { get; set; } = new();
    public List<Slidedeck> Slidedecks { get; set; } = new();
}