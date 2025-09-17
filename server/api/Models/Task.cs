namespace api.Models;

public enum TaskJobType
{
    Insights    = 0, // task.insights
    FullReport  = 1, // task.full_report
    Memo        = 2, // task.memo
    Slides      = 3, // task.slides
    SurveyData  = 4  // task.survey_data
}

public enum TaskJobStatus
{
    Queued,
    Running,
    Succeeded,
    Failed,
    Canceled
}

public class TaskJob
{
    public int Id { get; set; }

    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    // User relationship
    public int CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;

    public TaskJobType JobType { get; set; }
    public TaskJobStatus JobStatus { get; set; } = TaskJobStatus.Queued;

    public int? Progress { get; set; }

    public string PayloadJson { get; set; } = "{}";
    public string? ErrorMessage { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }

    public List<TaskArtifact> Artifacts { get; set; } = new();
}

public class TaskArtifact
{
    public int Id { get; set; }

    public int TaskId { get; set; }
    public TaskJob Task { get; set; } = null!;

    public string ResourceType { get; set; } = null!; // "Insight" | "Memo" | "Slidedeck"
    public string ResourceId { get; set; } = null!;
    public string Action { get; set; } = "Create"; // "Create" | "Append" | "Edit" | "Populate"

    public string? Model { get; set; }
    public int? PromptTokens { get; set; }
    public int? CompletionTokens { get; set; }
    public int? TotalTokens { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
