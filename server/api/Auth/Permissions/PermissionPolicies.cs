using Microsoft.EntityFrameworkCore;

namespace api.Auth.Permissions;

public static class PermissionPolicies
{
    public static void ApplyAll(ModelBuilder modelBuilder, int? currentUserId, bool isAdmin)
    {
        // Project-level visibility
        ProjectVisibilityPolicy.Apply(modelBuilder, currentUserId, isAdmin);

        // Project-owned entities
        ProjectOwnedEntitiesPolicy.Apply(modelBuilder, currentUserId, isAdmin);
    }
}