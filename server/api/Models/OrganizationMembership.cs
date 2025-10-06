// api/Models/OrganizationMembership.cs
namespace api.Models;

public class OrganizationMembership
{
    // Composite key will be (UserId, OrganizationId)
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string OrganizationId { get; set; } = string.Empty;
    public Organization Organization { get; set; } = null!;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}