// api/Dtos/ProjectAccessDtos.cs
namespace api.Dtos;

public record ProjectAccessListItemDto(
    int UserId,
    int ProjectId,
    bool AllowAccess,
    DateTimeOffset CreatedAt,
    string? Reason
);

public record CreateProjectAccessDto(
    int UserId,
    int ProjectId,
    bool AllowAccess,
    string? Reason
);