using System.ComponentModel.DataAnnotations;

namespace api.Dtos;

public record SlidedeckListItemDto(
    int Id,
    int ProjectId,
    string Name,
    string? PresentationId,
    string? SheetsId,
    string? PromptFocus,
    int CreatedById,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public record SlidedeckDetailDto(
    int Id,
    int ProjectId,
    string Name,
    string? PresentationId,
    string? SheetsId,
    string? PromptFocus,
    int CreatedById,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public record CreateSlidedeckDto(
    [Required] int ProjectId,
    [Required] string Name,
    string? PresentationId,
    string? SheetsId);

public record UpdateSlidedeckDto(
    string? Name,
    string? PresentationId,
    string? SheetsId,
    string? PromptFocus);