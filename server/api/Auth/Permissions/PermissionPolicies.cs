using Microsoft.EntityFrameworkCore;
using System;
using System.Linq.Expressions;

namespace api.Auth.Permissions;

public static class PermissionPolicies
{
    public static void ApplyAll(
        ModelBuilder modelBuilder,
        Expression<Func<int?>> currentUserExpr,
        Expression<Func<bool>> isAdminExpr)
    {
        ProjectVisibilityPolicy.Apply(modelBuilder, currentUserExpr, isAdminExpr);
        ProjectOwnedEntitiesPolicy.Apply(modelBuilder, currentUserExpr, isAdminExpr);
    }
}