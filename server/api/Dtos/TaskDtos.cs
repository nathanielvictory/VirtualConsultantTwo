using System.ComponentModel.DataAnnotations;
using api.Models;

namespace api.Dtos;


public record TaskListItemDto(
    int Id,
    int ProjectId,
    TaskJobType JobType,
    TaskStatus Status,
    int? Progress,
    int CreatedByUserId,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    DateTimeOffset? StartedAt,
    DateTimeOffset? CompletedAt
);

public record TaskArtifactDto(
    int Id,
    int TaskId,
    string ResourceType,
    string ResourceId,
    string Action,
    string? Model,
    int? PromptTokens,
    int? CompletionTokens,
    int? TotalTokens,
    DateTimeOffset CreatedAt
);

public record TaskDetailDto(
    int Id,
    int ProjectId,
    TaskJobType JobType,
    TaskStatus Status,
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
    TaskStatus? Status,
    int? Progress,
    string? PayloadJson,
    string? ErrorMessage,
    DateTimeOffset? StartedAt,
    DateTimeOffset? CompletedAt
);