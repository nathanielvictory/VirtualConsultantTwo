// Messaging/RabbitMq/RabbitMqOptions.cs
namespace api.Messaging.RabbitMq;

/// <summary>
/// Strongly-typed settings for RabbitMQ transport.
/// Bind this to configuration (appsettings.json).
/// </summary>
public sealed class RabbitMqOptions
{
    public string HostName { get; set; } = "localhost";
    public int Port { get; set; } = 5672;
    public string VirtualHost { get; set; } = "/";
    public string UserName { get; set; } = "guest";
    public string Password { get; set; } = "guest";

    // Messaging topology
    public string Exchange { get; set; } = "app.tasks";      // topic exchange
    public string RoutingKeyTaskCreated { get; set; } = "task.created";
}