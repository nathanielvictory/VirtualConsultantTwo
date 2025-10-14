using System;
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using api.Models;

namespace api.Auth.Permissions;

public static class ProjectVisibilityPolicy
{
    public static void Apply(
        ModelBuilder modelBuilder,
        Expression<Func<int?>> currentUserExpr,
        Expression<Func<bool>> isAdminExpr)
    {
        var canSeeProject = PermissionPredicates.CanSeeProject(currentUserExpr, isAdminExpr);
        modelBuilder.Entity<Project>().HasQueryFilter(canSeeProject);
    }
}