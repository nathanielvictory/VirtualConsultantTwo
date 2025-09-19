using System.ComponentModel.DataAnnotations;
using api.Models;

namespace api.Dtos;


public record SystemPromptListItemDto(
    int Id,
    TaskJobType PromptType,
    string Prompt,
    DateTime CreatedAt);

public record SystemPromptDetailDto(
    int Id,
    TaskJobType PromptType,
    string Prompt,
    DateTime CreatedAt);

public record CreateSystemPromptDto(
    [Required] TaskJobType PromptType,
    [Required] string Prompt);