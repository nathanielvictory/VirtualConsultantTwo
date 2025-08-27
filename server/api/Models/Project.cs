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

    public bool IsActive { get; set; }
    public bool HasData { get; set; }
    
    
    public List<Insight> Insights { get; set; } = new();
}