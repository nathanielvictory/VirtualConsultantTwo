using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class Memo
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    public string? DocId { get; set; }

    public int ProjectId { get; set; }
    public Project? Project { get; set; }
    
    public int CreatedById { get; set; }
    public User? CreatedBy { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}