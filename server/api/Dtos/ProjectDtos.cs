using System.ComponentModel.DataAnnotations;

namespace api.Dtos;

public record ProjectListItemDto(
    int Id,
    string Kbid,
    string Name,
    string OrganizationId,
    string? ProjectContext,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? LastRefreshed);

public record ProjectDetailDto(
    int Id,
    string Kbid,
    string Name,
    string OrganizationId,
    string? ProjectContext,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? LastRefreshed);

public record CreateProjectDto(
    [Required] string Kbid,
    [Required] string Name,
    [Required] string OrganizationId,
    string? ProjectContext,
    bool IsActive = true);

public record UpdateProjectDto(
    string? Kbid,
    string? Name,
    string? OrganizationId,
    string? ProjectContext,
    bool? IsActive);