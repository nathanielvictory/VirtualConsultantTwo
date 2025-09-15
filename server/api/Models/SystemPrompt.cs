using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace api.Models;

[JsonConverter(typeof(JsonStringEnumConverter))] // ensures JSON uses strings
public enum SystemPromptType
{
    Unknown,
    ResearchAgent,
    ChatAgent,
    RoutingAgent,
    Summarizer,
}

public class SystemPrompt
{
    public int Id { get; set; }

    [Required]
    public SystemPromptType PromptType { get; set; } = SystemPromptType.Unknown;

    [Required]
    [MaxLength(4000)] // tweak/raise/remove if you prefer TEXT below
    public string Prompt { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}