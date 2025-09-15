using System.Reflection;
using api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace api.Data;


public class AppDbContext : IdentityDbContext<User, IdentityRole<int>, int>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}
    
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Insight> Insights => Set<Insight>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Memo> Memos => Set<Memo>();
    public DbSet<Slidedeck> Slidedecks => Set<Slidedeck>();
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<TaskJob> Tasks => Set<TaskJob>();
    public DbSet<TaskArtifact> TaskArtifacts => Set<TaskArtifact>();
    public DbSet<SystemPrompt> SystemPrompts => Set<SystemPrompt>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // This scans the assembly and applies ProjectConfiguration (and any future ones).
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}