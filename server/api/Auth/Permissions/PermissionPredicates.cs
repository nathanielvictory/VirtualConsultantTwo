// api/Auth/Permissions/PermissionPredicates.cs
using System;
using System.Linq;
using System.Linq.Expressions;
using api.Models;

namespace api.Auth.Permissions;

public static class PermissionPredicates
{
    /// <summary>
    /// Returns a filter that defines who can see a Project.
    /// Evaluated per-request using context.CurrentUserId and context.IsAdmin.
    /// </summary>
    public static Expression<Func<Project, bool>> CanSeeProject(
        Expression<Func<int?>> currentUserExpr,
        Expression<Func<bool>> isAdminExpr)
    {
        // Pull out the expression bodies so EF can parameterize them.
        var currentUser = currentUserExpr.Body;
        var isAdmin = isAdminExpr.Body;

        // p =>
        var p = Expression.Parameter(typeof(Project), "p");

        // Build the predicate:
        //
        // isAdmin ||
        // (
        //   currentUser != null &&
        //   !p.ProjectAccesses.Any(a => a.UserId == currentUser && a.AllowAccess == false) &&
        //   (
        //       p.ProjectAccesses.Any(a => a.UserId == currentUser && a.AllowAccess == true)
        //       || p.Organization.Memberships.Any(m => m.UserId == currentUser)
        //   )
        // )

        var projectAccesses = Expression.PropertyOrField(p, nameof(Project.ProjectAccesses));
        var orgMemberships  = Expression.PropertyOrField(Expression.PropertyOrField(p, nameof(Project.Organization)), nameof(Organization.Memberships));

        var a = Expression.Parameter(typeof(ProjectAccess), "a");
        var m = Expression.Parameter(typeof(OrganizationMembership), "m");

        // a.UserId == currentUser
        var userIdMatch = Expression.Equal(
            Expression.PropertyOrField(a, nameof(ProjectAccess.UserId)),
            Expression.Convert(currentUser, typeof(int))
        );

        // a.UserId == currentUser && a.AllowAccess == true
        var allowAccess = Expression.AndAlso(
            userIdMatch,
            Expression.Equal(Expression.PropertyOrField(a, nameof(ProjectAccess.AllowAccess)), Expression.Constant(true))
        );

        // a.UserId == currentUser && a.AllowAccess == false
        var denyAccess = Expression.AndAlso(
            userIdMatch,
            Expression.Equal(Expression.PropertyOrField(a, nameof(ProjectAccess.AllowAccess)), Expression.Constant(false))
        );

        // m.UserId == currentUser
        var membershipMatch = Expression.Equal(
            Expression.PropertyOrField(m, nameof(OrganizationMembership.UserId)),
            Expression.Convert(currentUser, typeof(int))
        );

        // .Any(a => a.UserId == currentUser && a.AllowAccess == true)
        var anyAllow = Expression.Call(
            typeof(Enumerable),
            nameof(Enumerable.Any),
            new[] { typeof(ProjectAccess) },
            projectAccesses,
            Expression.Lambda<Func<ProjectAccess, bool>>(allowAccess, a)
        );

        // .Any(a => a.UserId == currentUser && a.AllowAccess == false)
        var anyDeny = Expression.Call(
            typeof(Enumerable),
            nameof(Enumerable.Any),
            new[] { typeof(ProjectAccess) },
            projectAccesses,
            Expression.Lambda<Func<ProjectAccess, bool>>(denyAccess, a)
        );

        // .Any(m => m.UserId == currentUser)
        var anyMembership = Expression.Call(
            typeof(Enumerable),
            nameof(Enumerable.Any),
            new[] { typeof(OrganizationMembership) },
            orgMemberships,
            Expression.Lambda<Func<OrganizationMembership, bool>>(membershipMatch, m)
        );

        // Combine the pieces
        var currentUserNotNull = Expression.NotEqual(currentUser, Expression.Constant(null, typeof(int?)));

        var allowCondition = Expression.OrElse(anyAllow, anyMembership);
        var denyCondition  = Expression.Not(anyDeny);

        var userCanSee = Expression.AndAlso(
            currentUserNotNull,
            Expression.AndAlso(denyCondition, allowCondition)
        );

        var fullCondition = Expression.OrElse(isAdmin, userCanSee);

        return Expression.Lambda<Func<Project, bool>>(fullCondition, p);
    }

    /// <summary>
    /// Rebinds a Project predicate onto a child entity that has a Project navigation,
    /// e.g., x => CanSeeProject(x.Project).
    /// Implemented via parameter substitution (no Expression.Invoke), so EF can translate it.
    /// </summary>
    public static Expression<Func<TChild, bool>> Projecting<TChild>(
        Expression<Func<Project, bool>> projectPredicate,
        Expression<Func<TChild, Project>> childToProject)
    {
        var param = childToProject.Parameters[0]; // x
        var projectExpr = childToProject.Body;    // x.Project

        var visitor = new ReplaceParameterVisitor(projectPredicate.Parameters[0], projectExpr);
        var newBody = visitor.Visit(projectPredicate.Body)!;

        return Expression.Lambda<Func<TChild, bool>>(newBody, param);
    }

    private sealed class ReplaceParameterVisitor : ExpressionVisitor
    {
        private readonly ParameterExpression _from;
        private readonly Expression _to;
        public ReplaceParameterVisitor(ParameterExpression from, Expression to)
        {
            _from = from;
            _to = to;
        }

        protected override Expression VisitParameter(ParameterExpression node)
            => node == _from ? _to : base.VisitParameter(node);
    }
}
