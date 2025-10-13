using Microsoft.EntityFrameworkCore;

namespace api.Auth.Permissions;

/// <summary>
/// Central place to register all authorization/query policies.
/// Add new policies here as you grow (Organization, Memo, Insight, etc.).
/// </summary>
public static class PermissionPolicies
{
    /// <param name="currentUserId">Authenticated user's Id, or null.</param>
    /// <param name="isAdmin">True when the user is an Admin (bypasses filters).</param>
    public static void ApplyAll(ModelBuilder modelBuilder, int? currentUserId, bool isAdmin)
    {
        // Projects
        ProjectVisibilityPolicy.Apply(modelBuilder, currentUserId, isAdmin);

        // As you add more:
        // OrganizationVisibilityPolicy.Apply(modelBuilder, currentUserId, isAdmin);
        // MemoVisibilityPolicy.Apply(modelBuilder, currentUserId, isAdmin);
        // InsightVisibilityPolicy.Apply(modelBuilder, currentUserId, isAdmin);
        // ...
    }
}