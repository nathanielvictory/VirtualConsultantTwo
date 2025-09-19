// Dtos/InsightDtos.cs
using System.ComponentModel.DataAnnotations;
using api.Models;

namespace api.Dtos;

public record InsightListItemDto(
    int Id,
    int ProjectId,
    int OrderIndex,
    string Content,
    InsightSource Source);

public record InsightDetailDto(
    int Id,
    int ProjectId,
    int OrderIndex,
    string Content,
    InsightSource Source);

public record CreateInsightDto(
    [Required] int ProjectId,
    [Required] string Content,
    InsightSource Source,
    int? OrderIndex);

public record UpdateInsightDto(
    string? Content,
    InsightSource? Source,
    int? OrderIndex);