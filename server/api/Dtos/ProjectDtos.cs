// Dtos/ProjectDtos.cs
using System.ComponentModel.DataAnnotations;
using api.Models;

namespace api.Dtos;

public record ProjectListItemDto(
    int Id,
    string Name,
    string OrganizationId,
    bool IsActive,
    bool HasData,
    DateTime? LastRefreshed,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record ProjectDetailDto(
    int Id,
    string Kbid,
    string Name,
    string OrganizationId,
    bool IsActive,
    bool HasData,
    DateTime? LastRefreshed,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    IReadOnlyList<InsightListItemDto> Insights);

public record CreateProjectDto(
    [Required, MaxLength(64)] string Kbid,
    [Required] string Name,
    [Required, MaxLength(64)] string OrganizationId,
    bool IsActive,
    bool HasData);

public record UpdateProjectDto(
    string? Name,
    bool? IsActive,
    bool? HasData,
    DateTime? LastRefreshed);