using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using api.Messaging.Abstractions;
using api.Messaging.IntegrationEvents;

namespace api.Messaging.RabbitMq;

public sealed class RabbitMqTaskEventPublisher : ITaskEventPublisher, IAsyncDisposable
{
    private readonly RabbitMqOptions _options;
    private readonly IConnection _conn;
    private readonly IChannel _channel;
    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

    public RabbitMqTaskEventPublisher(IOptions<RabbitMqOptions> options)
    {
        _options = options.Value;

        var factory = new ConnectionFactory
        {
            HostName = _options.HostName,
            Port = _options.Port,
            VirtualHost = _options.VirtualHost,
            UserName = _options.UserName,
            Password = _options.Password,
            AutomaticRecoveryEnabled = true,   // optional, but handy in dev
            TopologyRecoveryEnabled  = true
        };

        // v7 is async-only: block here once at startup to keep constructor simple
        _conn = factory.CreateConnectionAsync().GetAwaiter().GetResult();
        _channel = _conn.CreateChannelAsync().GetAwaiter().GetResult();

        // declare a durable topic exchange once (idempotent)
        _channel.ExchangeDeclareAsync(
            exchange: _options.Exchange,
            type:    ExchangeType.Topic,
            durable: true,
            autoDelete: false,
            arguments: null,
            noWait: false,
            cancellationToken: CancellationToken.None
        ).GetAwaiter().GetResult();
    }

    public async Task PublishTaskCreatedAsync(TaskCreatedEvent evt, CancellationToken ct = default)
    {
        if (ct.IsCancellationRequested) return;

        var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(evt, JsonOpts));

        var props = new BasicProperties
        {
            ContentType  = "application/json",
            DeliveryMode = DeliveryModes.Persistent, // durable message
            MessageId    = Guid.NewGuid().ToString(),
            Type         = nameof(TaskCreatedEvent),
            Timestamp    = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds())
        };

        await _channel.BasicPublishAsync(
            exchange: _options.Exchange,
            routingKey: _options.RoutingKeyTaskCreated,
            mandatory: false,
            basicProperties: props,
            body: body,
            cancellationToken: ct
        );
    }

    public async ValueTask DisposeAsync()
    {
        try
        {
            await _channel.CloseAsync();
            await _channel.DisposeAsync();
        }
        catch { /* ignore */ }

        try
        {
            await _conn.CloseAsync();
            await _conn.DisposeAsync();
        }
        catch { /* ignore */ }
    }
}
