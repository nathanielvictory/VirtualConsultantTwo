// api/Dtos/OrganizationMembershipDtos.cs
using System.ComponentModel.DataAnnotations;

namespace api.Dtos;

public record OrganizationMembershipListItemDto(
    int UserId,
    string UserName,
    string OrganizationId,
    string OrganizationName,
    DateTimeOffset CreatedAt
);

public record CreateOrganizationMembershipDto(
    [Required] int UserId,
    [Required] string OrganizationId
);