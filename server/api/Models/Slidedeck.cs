using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class Slidedeck
{
    public int Id { get; set; }
    
    public string Name { get; set; } = string.Empty;

    public string? PresentationId { get; set; }
    public string? SheetsId { get; set; }
    public string? PromptFocus { get; set; }

    public int ProjectId { get; set; }
    public Project? Project { get; set; }
    
    public int CreatedById { get; set; }
    public User? CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}