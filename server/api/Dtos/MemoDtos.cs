using System.ComponentModel.DataAnnotations;

namespace api.Dtos;

public record MemoListItemDto(
    int Id,
    int ProjectId,
    string Name,
    string? DocId,
    int CreatedById,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public record MemoDetailDto(
    int Id,
    int ProjectId,
    string Name,
    string? DocId,
    int CreatedById,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public record CreateMemoDto(
    [Required] int ProjectId,
    [Required] string Name,
    string? DocId);

public record UpdateMemoDto(
    string? Name,
    string? DocId);