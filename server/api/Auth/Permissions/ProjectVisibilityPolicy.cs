using Microsoft.EntityFrameworkCore;
using api.Models;

namespace api.Auth.Permissions;

public static class ProjectVisibilityPolicy
{
    public static void Apply(ModelBuilder modelBuilder, int? currentUserId, bool isAdmin)
    {
        var canSeeProject = PermissionPredicates.CanSeeProject(currentUserId, isAdmin);

        modelBuilder.Entity<Project>()
            .HasQueryFilter(canSeeProject);
    }
}