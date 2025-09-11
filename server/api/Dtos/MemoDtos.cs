using System.ComponentModel.DataAnnotations;

namespace api.Dtos;

public record MemoListItemDto(
    int Id,
    int ProjectId,
    string Name,
    string? DocId,
    string? PromptFocus,
    int CreatedById,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record MemoDetailDto(
    int Id,
    int ProjectId,
    string Name,
    string? DocId,
    string? PromptFocus,
    int CreatedById,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record CreateMemoDto(
    [Required] int ProjectId,
    [Required] string Name,
    string? DocId,
    string? PromptFocus,
    [Required] int CreatedById);

public record UpdateMemoDto(
    string? Name,
    string? DocId,
    string? PromptFocus);