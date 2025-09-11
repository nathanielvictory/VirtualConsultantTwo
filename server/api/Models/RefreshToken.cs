// Models/RefreshToken.cs
namespace api.Models;

public class RefreshToken
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string TokenHash { get; set; } = string.Empty;   // SHA-256 of the raw token
    public DateTime CreatedAtUtc { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }
    public int? ReplacedByTokenId { get; set; }

    public string? UserAgent { get; set; }
    public string? IpAddress { get; set; }

    public User? User { get; set; }
}