// Messaging/Abstractions/ITaskEventPublisher.cs
namespace api.Messaging.Abstractions
{
    /// <summary>
    /// Publishes task payloads to the message bus, routed by JobType.
    /// The payload body MUST be exactly what the worker schema expects.
    /// </summary>
    public interface ITaskEventPublisher
    {
        Task PublishAsync(api.Models.TaskJobType jobType, string payloadJson, CancellationToken ct = default);
    }
}