using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using api.Models;

namespace api.Auth.Permissions;

public static class ProjectOwnedEntitiesPolicy
{
    public static void Apply(
        ModelBuilder modelBuilder,
        Expression<Func<int?>> currentUserExpr,
        Expression<Func<bool>> isAdminExpr)
    {
        var canSeeProject = PermissionPredicates.CanSeeProject(currentUserExpr, isAdminExpr);

        modelBuilder.Entity<Insight>()
            .HasQueryFilter(PermissionPredicates.Projecting<Insight>(canSeeProject, x => x.Project!));

        modelBuilder.Entity<Memo>()
            .HasQueryFilter(PermissionPredicates.Projecting<Memo>(canSeeProject, x => x.Project!));

        modelBuilder.Entity<Slidedeck>()
            .HasQueryFilter(PermissionPredicates.Projecting<Slidedeck>(canSeeProject, x => x.Project!));

        modelBuilder.Entity<TaskJob>()
            .HasQueryFilter(PermissionPredicates.Projecting<TaskJob>(canSeeProject, x => x.Project));
        
        modelBuilder.Entity<TaskArtifact>()
            .HasQueryFilter(PermissionPredicates.Projecting<TaskArtifact>(canSeeProject, x => x.Task.Project));
    }
}