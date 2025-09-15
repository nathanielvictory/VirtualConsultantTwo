using System.ComponentModel.DataAnnotations;

namespace api.Dtos;

// Using strings for PromptType in DTOs makes the API extra friendly to the frontend
public record SystemPromptListItemDto(
    int Id,
    string PromptType,
    string Prompt,
    DateTime CreatedAt);

public record SystemPromptDetailDto(
    int Id,
    string PromptType,
    string Prompt,
    DateTime CreatedAt);

public record CreateSystemPromptDto(
    [Required] string PromptType,
    [Required] string Prompt);