namespace api.Models;

public class Organization
{
    // User-provided primary key (sync with external system)
    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    // Navigation: one org has many projects
    public List<Project> Projects { get; set; } = new();
    public List<OrganizationMembership> Memberships { get; set; } = new();
}