using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace api.Models;

public class SystemPrompt
{
    public int Id { get; set; }

    [Required]
    public TaskJobType PromptType { get; set; } = default; // default enum value (0)

    [Required]
    public string Prompt { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}