using System.ComponentModel.DataAnnotations;
using api.Models;

namespace api.Dtos
{
    public record TaskArtifactDto(
        int Id,
        int TaskId,
        TaskArtifactResourceType ResourceType,
        int? CreatedResourceId,
        TaskArtifactActionType Action,
        int? TotalTokens,
        DateTimeOffset CreatedAt
    );

    public record CreateTaskArtifactDto(
        [Required] TaskArtifactResourceType ResourceType,
        TaskArtifactActionType Action = TaskArtifactActionType.Create,
        int? CreatedResourceId = null,
        int? TotalTokens = null
    );

    public record UpdateTaskArtifactDto(
        TaskArtifactResourceType? ResourceType,
        TaskArtifactActionType? Action,
        int? CreatedResourceId,
        int? TotalTokens
    );

    // unchanged pieces shown here for completeness — only artifacts changed
    public record TaskListItemDto(
        int Id,
        int ProjectId,
        TaskJobType JobType,
        TaskJobStatus Status,
        int? Progress,
        int CreatedByUserId,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt,
        DateTimeOffset? StartedAt,
        DateTimeOffset? CompletedAt
    );

    public record TaskDetailDto(
        int Id,
        int ProjectId,
        TaskJobType JobType,
        TaskJobStatus Status,
        int? Progress,
        int CreatedByUserId,
        string PayloadJson,
        string? ErrorMessage,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt,
        DateTimeOffset? StartedAt,
        DateTimeOffset? CompletedAt,
        List<TaskArtifactDto> Artifacts
    );

    public record CreateTaskDto(
        [Required] int ProjectId,
        [Required] TaskJobType JobType,
        [Required] int CreatedByUserId,
        string PayloadJson = "{}"
    );

    public record UpdateTaskDto(
        TaskJobType? Type,
        TaskJobStatus? Status,
        int? Progress,
        string? PayloadJson,
        string? ErrorMessage,
        DateTimeOffset? StartedAt,
        DateTimeOffset? CompletedAt
    );
}
