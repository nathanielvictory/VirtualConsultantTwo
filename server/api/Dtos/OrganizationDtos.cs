using System.ComponentModel.DataAnnotations;

namespace api.Dtos;

public record OrganizationListItemDto(
    string Id,
    string Name);

public record OrganizationDetailDto(
    string Id,
    string Name);

public record CreateOrganizationDto(
    [Required] string Id,
    [Required] string Name);

public record UpdateOrganizationDto(
    string? Name);