// Messaging/IntegrationEvents/TaskCreatedEvent.cs
using api.Models;

namespace api.Messaging.IntegrationEvents;

/// <summary>
/// Integration event published when a TaskJob is created.
/// Workers consume this to begin processing and then call back your API
/// (e.g., PATCH /api/tasks/{id}) to report progress/results.
/// </summary>
public sealed record TaskCreatedEvent(
    int TaskId,
    int ProjectId,
    int CreatedByUserId,
    TaskJobType JobType,
    string PayloadJson,
    DateTimeOffset CreatedAt
);