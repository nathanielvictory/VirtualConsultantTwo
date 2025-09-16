// Messaging/Abstractions/ITaskEventPublisher.cs
using api.Messaging.IntegrationEvents;

namespace api.Messaging.Abstractions;

/// <summary>
/// Abstraction for publishing task-related integration events
/// (e.g., to RabbitMQ, Azure Service Bus, etc.).
/// Controllers/services depend on this; the transport-specific
/// implementation is registered in DI.
/// </summary>
public interface ITaskEventPublisher
{
    /// <summary>
    /// Publish an event indicating a task was created and is ready for processing.
    /// Implementations should be fire-and-forget (no retries here),
    /// leaving reliability to infra/outbox if/when you add it.
    /// </summary>
    Task PublishTaskCreatedAsync(TaskCreatedEvent evt, CancellationToken ct = default);
}