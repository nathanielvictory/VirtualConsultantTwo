using System.ComponentModel.DataAnnotations;
using api.Models;

namespace api.Dtos;


public record SystemPromptListItemDto(
    int Id,
    TaskJobType PromptType,
    string Prompt,
    DateTimeOffset CreatedAt);

public record SystemPromptDetailDto(
    int Id,
    TaskJobType PromptType,
    string Prompt,
    DateTimeOffset CreatedAt);

public record CreateSystemPromptDto(
    [Required] TaskJobType PromptType,
    [Required] string Prompt);