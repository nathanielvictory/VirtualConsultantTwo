using System.Reflection;
using api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using api.Auth.CurrentUser;
using api.Auth.Permissions;
    
namespace api.Data;


public class AppDbContext : IdentityDbContext<User, IdentityRole<int>, int>
{
    private readonly int? _currentUserId;
    private readonly bool _isAdmin;
    
    public int? CurrentUserId => _currentUserId;
    public bool IsAdmin => _isAdmin;
    
    public AppDbContext(
        DbContextOptions<AppDbContext> options,
        ICurrentUserAccessor currentUser
    ) : base(options)
    {
        _currentUserId = currentUser.UserId;
        _isAdmin = currentUser.IsAdmin;
    }
    
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Insight> Insights => Set<Insight>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Memo> Memos => Set<Memo>();
    public DbSet<Slidedeck> Slidedecks => Set<Slidedeck>();
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<TaskJob> Tasks => Set<TaskJob>();
    public DbSet<TaskArtifact> TaskArtifacts => Set<TaskArtifact>();
    public DbSet<SystemPrompt> SystemPrompts => Set<SystemPrompt>();
    public DbSet<OrganizationMembership> OrganizationMemberships => Set<OrganizationMembership>();
    public DbSet<ProjectAccess> ProjectAccesses => Set<ProjectAccess>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // This scans the assembly and applies ProjectConfiguration (and any future ones).
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        
        PermissionPolicies.ApplyAll(modelBuilder,
            () => CurrentUserId, () => IsAdmin);
    }
}